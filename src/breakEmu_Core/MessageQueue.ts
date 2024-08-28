import { DofusMessage, messages } from "@breakEmu_Protocol/IO"
import ServerClient from "@breakEmu_Server/ServerClient"
import ansiColorCodes from "./Colors"
import Logger from "./Logger"

interface IMessageQueueItem {
	message: DofusMessage
	client: ServerClient
	resolve: Function
	reject: Function
	sequence: number
}

class MessageQueue {
	private logger: Logger = new Logger("MessageQueue")
	private static _instance: MessageQueue

	private queue: IMessageQueueItem[] = []
	private isProcessing = false
	private processingLock = false

	private sequenceCounter: number = 0

	public static getInstance(): MessageQueue {
		if (!MessageQueue._instance) {
			MessageQueue._instance = new MessageQueue()
		}
		return MessageQueue._instance
	}

	public async enqueue(
		message: DofusMessage,
		client: ServerClient
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const sequence = this.sequenceCounter++
			this.queue.push({ message, client, resolve, reject, sequence })
			this.queue.sort((a, b) => a.sequence - b.sequence)

			if (!this.isProcessing) {
				this.processQueue()
			}
		})
	}

	private async wait(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	private async processQueue(): Promise<void> {
		this.isProcessing = true
		while (this.queue.length > 0) {
			if (this.processingLock) {
				await this.wait(50)
				continue
			}

			this.processingLock = true
			const item = this.queue.shift()
			if (item) {
				try {
					const isMessageSend = item.client.socket.write(
						//@ts-ignore
						item.client.serialize(item.message as DofusMessage),
						(error) => {
							if (error) {
								this.logger.writeAsync(
									`Error sending message: ${error.stack}`,
									ansiColorCodes.red
								)
								item.reject(error)
								this.processingLock = false
								return
							}
							item.resolve()
							this.processingLock = false
						}
					)

					if (isMessageSend) {
						await this.logger.writeAsync(
							`Message '${messages[item.message.id].name}' sent! (Sequence: ${
								item.sequence
							})`,
							ansiColorCodes.green
						)
					} else {
						item.reject(
							new Error(
								`Message ${
									messages[item.message.id].name
								} not sent (Sequence: ${item.sequence})`
							)
						)
					}
				} catch (error) {
					item.reject(error)
					this.processingLock = false
				}
			}
		}
		this.isProcessing = false
	}
}

export default MessageQueue
