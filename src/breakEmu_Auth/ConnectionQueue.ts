import { Socket } from "net"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import { PromisePool } from "@supercharge/promise-pool"
import { AuthClient } from "./AuthClient"
import { AuthServer } from "./AuthServer"

interface IQueue {
	position: number
	socket: Socket
}

class ConnectionQueue {
	private logger: Logger = new Logger("ConnectionQueue")
	private static instance: ConnectionQueue

	private queue: IQueue[] = []

	private isProcessing = false
	public MAX_DOFUS_MESSAGE_HEADER_SIZE: number = 10

	private constructor() {}

	public static getInstance(): ConnectionQueue {
		if (!ConnectionQueue.instance) {
			ConnectionQueue.instance = new ConnectionQueue()
		}
		return ConnectionQueue.instance
	}

	public async enqueue(socket: Socket): Promise<void> {
		const position = this.queue.length + 1
		this.queue.push({ position, socket })

		await this.logger.writeAsync(
			`Client ${position} added to queue`,
			ansiColorCodes.green
		)

		if (!this.isProcessing) {
			await this.processQueue()
		}
	}

	public async processQueue(): Promise<void> {
		const { results, errors } = await PromisePool.withConcurrency(1)
			.for(this.queue)
			.onTaskStarted(async (socket) => {
				await this.logger.writeAsync(
					`Client ${socket.position} processing | ${this.queue.length} in queue`,
					ansiColorCodes.yellow
				)

				this.isProcessing = true
			})
			.onTaskFinished(async (socket) => {
				const res = this.queue.find(
					(queue) => queue.position === socket.position
				)
				if (res) {
					await this.logger.writeAsync(
						`Client ${res.position} removed from queue`
					)

          const index = this.queue.indexOf(res)

          if (index > -1) {
            this.queue.splice(index, 1)
          }

					await this.logger.writeAsync(
						`Client ${socket.position} processed | ${this.queue.length} in queue`,
						ansiColorCodes.bgMagenta
					)
				}
				this.isProcessing = false
			})
			.process(async (socket) => {
				await this.processConnection(socket)
			})

		if (errors.length > 0) {
			await this.logger.writeAsync(errors.join("\n"), ansiColorCodes.red)
		}
	}

	private async processConnection(socket: IQueue): Promise<void> {
		await this.logger.writeAsync(
			`Client ${socket.position} processing connection`
		)

		const client = new AuthClient(socket.socket)
		await AuthServer.getInstance().AddClient(client)
		await client.setupEventHandlers()

		await client.initialize()
		// await new Promise((resolve) => setTimeout(resolve, 5000))

		await this.logger.writeAsync(
			`Client ${socket.position} processed connection`,
			ansiColorCodes.bgGreen
		)
	}
}

export default ConnectionQueue

// public serialize(message: DofusMessage): Buffer {
//   const headerWriter = new BinaryBigEndianWriter({
//     maxBufferLength: this.MAX_DOFUS_MESSAGE_HEADER_SIZE,
//   })
//   const messageWriter = new BinaryBigEndianWriter({
//     maxBufferLength: 10240,
//   })

//   if (!(message?.id in messages)) {
//     throw `Undefined message (id: ${message.id})`
//   }

//   // @ts-ignore
//   message.serialize(messageWriter)

//   DofusNetworkMessage.writeHeader(headerWriter, message.id, messageWriter)

//   this.logger.writeAsync(`Serialized dofus message '${message.id}'`)

//   return Buffer.concat([headerWriter.getBuffer(), messageWriter.getBuffer()])
// }
