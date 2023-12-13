import { Socket } from "net"
import Logger from "../breakEmu_Core/Logger"
import { AuthServer } from "./AuthServer"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import ServerClient from "../breakEmu_Server/ServerClient"
import { AuthConfiguration } from "../breakEmu_Core/AuthConfiguration"
import RSAKeyHandler from "../breakEmu_Core/RSAKeyHandler"
import ServerStatus from "./enum/ServerStatus"
import {
	BinaryBigEndianReader,
	BinaryBigEndianWriter,
	DofusMessage,
	DofusNetworkMessage,
	HelloConnectMessage,
	IdentificationMessage,
	SystemMessageDisplayMessage,
	messages,
	ProtocolRequired,
  CredentialsAcknowledgementMessage,
} from "../breakEmu_Server/IO"
import { privateDecrypt } from "crypto"
import { RSA_PKCS1_PADDING } from "constants"

export class AuthClient extends ServerClient {
	public logger: Logger = new Logger("AuthClient")

	public MAX_DOFUS_MESSAGE_HEADER_SIZE: number = 10

	public _RSAKeyHandler: RSAKeyHandler = RSAKeyHandler.getInstance()

	public constructor(socket: Socket) {
		super(socket)
	}

	public async setupEventHandlers(): Promise<void> {
		return await new Promise<void>((resolve, reject) => {
			this.Socket.on("end", () => this.OnClose())
			this.Socket.on("error", (error) => {
				this.logger.write(`Error: ${error.message}`, ansiColorCodes.red)
			})

			resolve()
		})
	}

	public async handleData(
		socket: Socket,
		data: Buffer,
		attrs: any
	): Promise<void> {
		await this.logger.writeAsync(
			`Received data from ${socket.remoteAddress}: ${data.toString("hex")}`,
			ansiColorCodes.lightGray
		)

		const message = this.deserialize(data)

		switch (message.id) {
			case IdentificationMessage.id:
				const clearCredentials = privateDecrypt(
					{
						key: attrs.privateKey,
						padding: RSA_PKCS1_PADDING,
					},
					new Int8Array((message as IdentificationMessage).credentials!)
				)

				const credentialsReader = new BinaryBigEndianReader({
					maxBufferLength: clearCredentials.length,
				}).writeBuffer(clearCredentials)

				credentialsReader.setPointer(credentialsReader.getPointer() + 32)

				const AESKey = credentialsReader.readBuffer(32, true, {
					maxBufferLength: 32,
				})
				const username = credentialsReader.readUTFBytes(
					credentialsReader.readByte()
				)
				const password = credentialsReader.readUTFBytes(
					credentialsReader.getReadableSize()
				)

				this.logger.writeAsync(
          `AESKey: ${AESKey.toString("hex")}, username: ${username}, password: ${password}`,
          ansiColorCodes.lightGray
        )

        await this.logger.writeAsync("Sending CredentialsAknowledgementMessage message")
        await this.Send(this.serialize(new CredentialsAcknowledgementMessage()))
				break
		}
	}

	public OnClose(): void {
		AuthServer.getInstance().RemoveClient(this)
		this.logger.write(
			`Client ${this.Socket.remoteAddress}:${this.Socket.remotePort} disconnected`,
			ansiColorCodes.red
		)
	}

	public async initialize(): Promise<void> {
		try {
			if (AuthServer.getInstance().ServerState === ServerStatus.Maintenance) {
				this.logger.write("Sending Maintenance message")
				await this.Send(
					this.serialize(new SystemMessageDisplayMessage(true, 13, []))
				)

				this.OnClose()
				return
			}

			await this.logger.writeAsync("Sending ProtocolRequired message")
			await this.Send(
				this.serialize(
					new ProtocolRequired(
						AuthConfiguration.getInstance().dofusProtocolVersion
					)
				)
			)

			await this.logger.writeAsync("Sending HelloConnectMessage message")

			this._RSAKeyHandler.generateKeyPair()
			const attrs = this._RSAKeyHandler.getAttribute()
			const encryptedPublicKey = this._RSAKeyHandler.encryptedPublicKey

			await this.Send(
				this.serialize(
					new HelloConnectMessage(attrs.salt, Array.from(encryptedPublicKey))
				)
			)

			this.Socket.on(
				"data",
				async (data) => await this.handleData(this.Socket, data, attrs)
			)
		} catch (error) {
			await this.logger.writeAsync(
				`Error initializing client: ${error}`,
				ansiColorCodes.red
			)
		}
	}

	public serialize(message: DofusMessage): Buffer {
		const headerWriter = new BinaryBigEndianWriter({
			maxBufferLength: this.MAX_DOFUS_MESSAGE_HEADER_SIZE,
		})
		const messageWriter = new BinaryBigEndianWriter({
			maxBufferLength: 10240,
		})

		if (!(message?.id in messages)) {
			throw `Undefined message (id: ${message.id})`
		}

		// @ts-ignore
		message.serialize(messageWriter)

		DofusNetworkMessage.writeHeader(headerWriter, message.id, messageWriter)

		this.logger.writeAsync(`Serialized dofus message '${message.id}'`)
		console.log(message)

		return Buffer.concat([headerWriter.getBuffer(), messageWriter.getBuffer()])
	}

	deserialize(data: Buffer): DofusMessage {
		const reader = new BinaryBigEndianReader({
			maxBufferLength: data.length,
		}).writeBuffer(data)

		const {
			messageId,
			instanceId,
			payloadSize,
		} = DofusNetworkMessage.readHeader(reader)

		if (!(messageId in messages)) {
			this.logger.writeAsync(`Undefined message (id: ${messageId})`, ansiColorCodes.red)
		}

		const message = new messages[messageId]()
		message.deserialize(reader)

		return message
	}

	// private stringToArrayBuffer(str: string) {
	// 	const buffer = new ArrayBuffer(str.length)
	// 	const view = new Uint8Array(buffer)
	// 	for (let i = 0; i < str.length; i++) {
	// 		view[i] = str.charCodeAt(i)
	// 	}
	// 	return buffer
	// }
}
