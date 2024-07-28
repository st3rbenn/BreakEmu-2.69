import { Socket } from "net"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import MessageQueue from "../breakEmu_Core/MessageQueue"
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
	public socket: Socket

	private _messageTemp: any

	private static readonly MAX_DOFUS_MESSAGE_HEADER_SIZE: number = 10

	constructor(socket: Socket) {
		this.socket = socket
	}

	public get Socket(): Socket {
		return this.socket
	}

	public async Send(messageData: DofusMessage): Promise<void> {
		try {
			await MessageQueue.getInstance().enqueue(messageData, this)
		} catch (error) {
			this.logger.writeAsync(
				`Error sending message: ${error}`,
				ansiColorCodes.red
			)
			throw error
		}
	}

	public async setupEventHandlers(): Promise<void> {
		return new Promise<void>((resolve) => {
			this.Socket.on("end", () => {
				this.OnClose()
			})

			this.Socket.on("error", (error) => {
				this.logger.write(`Error: ${error.message}`, ansiColorCodes.red)
			})

			resolve()
		})
	}

	abstract OnClose(): void

	public serialize(message: DofusMessage): Buffer {
		const headerWriter = new BinaryBigEndianWriter({
			maxBufferLength: ServerClient.MAX_DOFUS_MESSAGE_HEADER_SIZE,
		})
		const messageWriter = new BinaryBigEndianWriter({
			maxBufferLength: 10240,
		})

		if (!(message?.id in messages)) {
			const errorMessage = `Undefined message (id: ${message?.id}, name: ${
				messages[message?.id]?.name
			})`
			this.logger.writeAsync(errorMessage, ansiColorCodes.red)
			throw new Error(errorMessage)
		}

		message.serialize(messageWriter)

		DofusNetworkMessage.writeHeader(headerWriter, message.id, messageWriter)

		this._messageTemp = message

		return Buffer.concat([
			headerWriter.getUint8Array(),
			messageWriter.getUint8Array(),
		])
	}

	public deserialize(data: Buffer): DofusMessage | null {
		let messageId // Déclarer messageId en dehors du bloc try

		try {
			const reader = new BinaryBigEndianReader({
				maxBufferLength: data.length,
			}).writeBuffer(data)

			const header = DofusNetworkMessage.readHeader(reader)
			messageId = header.messageId // Affecter la valeur à messageId
			const instanceId = header.instanceId
			const payloadSize = header.payloadSize

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
		} catch (error) {
			// Utiliser messageId ici
			this.logger.writeAsync(
				`Error while deserializing message with ID ${messageId}: ${error}`,
				ansiColorCodes.red
			)

			return null
		}
	}
}

export default ServerClient
