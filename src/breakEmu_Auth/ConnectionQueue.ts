import { PromisePool } from "@supercharge/promise-pool"
import { Socket } from "net"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import AuthClient from "./AuthClient"
import AuthServer from "./AuthServer"
import AuthTransition from "./AuthTransition"
import Container from "@breakEmu_Core/container/Container"

interface IQueue {
	position: number
	socket: Socket
}

class ConnectionQueue {
	private logger: Logger = new Logger("ConnectionQueue")
	private container: Container = Container.getInstance()

	private queue: IQueue[] = []

	private isProcessing = false

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
					const index = this.queue.indexOf(res)

					if (index > -1) {
						this.queue.splice(index, 1)
					}

					await this.logger.writeAsync(
						`Client ${socket.position} processed | ${this.queue.length} in queue`,
						ansiColorCodes.bgMagenta
					)
					await this.logger.writeAsync(
						`Client ${res.position} processed and removed from queue`,
						ansiColorCodes.bgGreen
					)
				}
				this.isProcessing = false

				if (this.queue.length > 0) {
					await this.processQueue()
				} else {
					await this.logger.writeAsync(
						`Queue is empty`,
						ansiColorCodes.bgYellow
					)
				}
			})
			.process(async (socket) => {
				await this.processConnection(socket)
			})

		if (errors.length > 0) {
			await this.logger.writeAsync(errors.join("\n"), ansiColorCodes.red)
		}
	}

	private async processConnection(socket: IQueue): Promise<void> {
		const client = new AuthClient(socket.socket)
		await this.container.get(AuthServer).AddClient(client)
		client.setupEventHandlers()

		await client.initialize()
	}
}

export default ConnectionQueue
