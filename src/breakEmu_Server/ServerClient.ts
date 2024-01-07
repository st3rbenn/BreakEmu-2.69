import { Socket } from "net"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import {
	BinaryBigEndianReader,
	BinaryBigEndianWriter,
	DofusMessage,
	DofusNetworkMessage,
	messages,
} from "./IO"

abstract class ServerClient {
	public abstract logger: Logger
	private socket: Socket

	private _messageTemp: any

	private MAX_DOFUS_MESSAGE_HEADER_SIZE: number = 10

	constructor(socket: Socket) {
		this.socket = socket
	}

	public get Socket(): Socket {
		return this.socket
	}

	public async Send(messageData: Buffer): Promise<void> {
		if (ConfigurationManager.getInstance().showProtocolMessage) {
			this.logger.write(`Send message '${messages[this._messageTemp.id].name}'`)
		}

		this.socket.write(messageData)
		// await new Promise(async (resolve, reject) => {
		// 	if (!this.socket || !this.socket.writable) {
		// 		throw new Error("Socket is not writable")
		// 	}

		// 	try {

		// 	} catch (error) {
		// 		await this.logger.writeAsync(
		// 			`Error sending message: ${error}`,
		// 			ansiColorCodes.red
		// 		)
		// 		reject(error)
		// 	}
		// })
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

	abstract OnClose(): void

	public serialize(message: DofusMessage): Buffer {
		const headerWriter = new BinaryBigEndianWriter({
			maxBufferLength: this.MAX_DOFUS_MESSAGE_HEADER_SIZE,
		})
		const messageWriter = new BinaryBigEndianWriter({
			maxBufferLength: 10240,
		})

		if (!(message?.id in messages)) {
			throw `Undefined message (id: ${message.id}, name: ${
				messages[message.id].name
			})`
		}

		// @ts-ignore
		message.serialize(messageWriter)

		DofusNetworkMessage.writeHeader(headerWriter, message.id, messageWriter)

		this._messageTemp = message

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

		if (
			!(messageId in messages) &&
			ConfigurationManager.getInstance().showProtocolMessage
		) {
			this.logger.writeAsync(
				`Undefined message (id: ${messageId})`,
				ansiColorCodes.red
			)
		}

		const message = new messages[messageId]()
		message.deserialize(reader)

		return message
	}
}

export default ServerClient
