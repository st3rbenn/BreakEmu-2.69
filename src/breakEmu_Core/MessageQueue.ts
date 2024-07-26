import { DofusMessage, messages } from "../breakEmu_Server/IO"
import ServerClient from "../breakEmu_Server/ServerClient"
import { ansiColorCodes } from "./Colors"
import Logger from "./Logger"

interface IMessageQueueItem {
	message: DofusMessage
	client: ServerClient
	resolve: Function
	reject: Function
}

class MessageQueue {
	private logger: Logger = new Logger("MessageQueue")
	private static _instance: MessageQueue

	private queue: IMessageQueueItem[] = []
	private isProcessing = false
	private processingLock = false

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
			this.queue.push({ message, client, resolve, reject })

			if (!this.isProcessing) {
				this.processQueue()
			}
		})
	}

	private async wait(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	private async processQueue(): Promise<void> {
		while (this.queue.length > 0 && !this.processingLock) {
			this.processingLock = true

			const item = this.queue.shift()
			if (item) {
				try {
					const isMessageSend = item.client.socket.write(
						item.client.serialize(item.message),
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
							`Message '${messages[item.message.id].name}' sent!`,
							ansiColorCodes.green
						)
					} else {
						item.reject(
							new Error(`Message ${messages[item.message.id].name} not sent`)
						)
					}
				} catch (error) {
					item.reject(error)
				}
			}

			await this.wait(50)
			this.processingLock = false
		}
		this.isProcessing = false
	}
}

export default MessageQueue
