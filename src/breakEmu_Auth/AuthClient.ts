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
	NicknameChoiceRequestMessage,
	IdentificationSuccessMessage,
	ServersListMessage,
} from "../breakEmu_Server/IO"
import { privateDecrypt } from "crypto"
import { RSA_PKCS1_PADDING } from "constants"
import AuthController from "../breakEmu_API/controller/auth.controller"
import Prisma from "@prisma/client"
import Account from "../breakEmu_API/model/account.model"
import WorldServerManager from "../breakEmu_World/WorldServerManager"
import WorldServer from "../breakEmu_World/WorldServer"

export class AuthClient extends ServerClient {
	public logger: Logger = new Logger("AuthClient")

	public MAX_DOFUS_MESSAGE_HEADER_SIZE: number = 10

	public _RSAKeyHandler: RSAKeyHandler = RSAKeyHandler.getInstance()

	private _account: Account | null = null

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

	public get account(): Account | null {
		return this._account
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
				this.handleIdentificationMessage(attrs, message)
				break
			case NicknameChoiceRequestMessage.id:
				this.handleNicknameChoiceRequestMessage(message)
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

		return Buffer.concat([headerWriter.getBuffer(), messageWriter.getBuffer()])
	}

	public deserialize(data: Buffer): DofusMessage {
		const reader = new BinaryBigEndianReader({
			maxBufferLength: data.length,
		}).writeBuffer(data)

		const {
			messageId,
			instanceId,
			payloadSize,
		} = DofusNetworkMessage.readHeader(reader)

		if (!(messageId in messages)) {
			this.logger.writeAsync(
				`Undefined message (id: ${messageId})`,
				ansiColorCodes.red
			)
		}

		const message = new messages[messageId]()
		message.deserialize(reader)

		return message
	}

	private async handleIdentificationMessage(
		attrs: any,
		message: DofusMessage
	): Promise<void> {
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
			`AESKey: ${AESKey.toString(
				"hex"
			)}, username: ${username}, password: ${password}`,
			ansiColorCodes.lightGray
		)

		await this.logger.writeAsync(
			"Sending CredentialsAknowledgementMessage message"
		)
		await this.Send(this.serialize(new CredentialsAcknowledgementMessage()))

		const authController = new AuthController(this)

		const user = await authController.login(username, password)

		this._account = new Account(
			user?.id as number,
			user?.username as string,
			user?.password as string,
			user?.pseudo as string,
			user?.email as string,
			user?.is_verified as boolean,
			user?.firstname as string,
			user?.lastname as string,
			user?.birthdate as Date,
			user?.login_at as Date,
			user?.logout_at as Date,
			user?.updated_at as Date,
			user?.created_at as Date,
			user?.deleted_at as Date,
			user?.ip as string,
			user?.roleId as number,
			user?.is_banned as boolean
		)

		await this.handleIdentificationSuccessMessage()
		await this.handleServersListMessage()
	}

	private async handleNicknameChoiceRequestMessage(
		message: DofusMessage
	): Promise<void> {
		const nickname = (message as NicknameChoiceRequestMessage).nickname
		const nicknameController = new AuthController(this)
		this.logger.writeAsync(`Nickname: ${nickname}`)
		const isNicknameDone = await nicknameController.setNickname(
			nickname as string
		)

		if (isNicknameDone) {
			await this.handleIdentificationSuccessMessage()
		}
	}

	public async handleIdentificationSuccessMessage(
		wasArleadyConnected: boolean = false
	): Promise<void> {
		await this.logger.writeAsync("Sending IdentificationSuccessMessage message")
		console.log(this.account)
		const subscriptionEndDateUnix = Math.floor(Date.now() * 1000) + 31536000
		// const subscriptionElapsedDuration =
		// 	(this._account?.created_at.getTime() as number) - Date.now()

		const identificationSuccessMessage = new IdentificationSuccessMessage(
			this._account?.is_admin,
			false,
      this._account?.pseudo,
      "1",
			wasArleadyConnected,
			this._account?.username,
			this._account?.id,
			0,
			this._account?.created_at.getTime(),
			subscriptionEndDateUnix,
			0
		)

		await this.Send(this.serialize(identificationSuccessMessage))
	}

	public async handleServersListMessage(): Promise<void> {
		this.Send(
			this.serialize(
				new ServersListMessage(
					WorldServerManager.getInstance().gameServerInformationArray(this),
					true
				)
			)
		)
	}

	public canAccessWorld(server: WorldServer): boolean {
		const isAccessGranted =
			(this?.account?.role as number) <= server.worldServerData.RequiredRole

		if (!isAccessGranted) {
			this.logger.writeAsync(
				`User ${this.account?.username} tried to access server ${server.worldServerData.Id} but was denied`,
				ansiColorCodes.red
			)
		}

		return isAccessGranted
	}
}
