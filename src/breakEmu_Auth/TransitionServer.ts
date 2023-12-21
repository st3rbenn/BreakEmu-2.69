import Logger from "../breakEmu_Core/Logger"
import WorldController from "../breakEmu_API/controller/world.controller"
import WorldServerManager from "../breakEmu_World/WorldServerManager"
import amqp, { Channel, Connection, ConsumeMessage } from "amqplib"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import { AuthServer } from "./AuthServer"
import { ServerStatusUpdateMessage } from "../breakEmu_Server/IO"

class TransitionManager {
	private logger: Logger = new Logger("TransitionServer")
	private connection: Connection | null = null
	private channel: Channel | null = null
	private readonly uri: string

	private static _instance: TransitionManager
	public static getInstance(): TransitionManager {
		if (!TransitionManager._instance) {
			TransitionManager._instance = new TransitionManager(
				process.env.RABBITMQ_URI || "amqp://localhost"
			)
		}

		return TransitionManager._instance
	}

	constructor(uri: string) {
		this.uri = uri
	}

	async waitForConnection(): Promise<void> {
		while (!this.connection) {
			await new Promise((resolve) => setTimeout(resolve, 1000))
		}
	}

	async connect(): Promise<void> {
		try {
			this.connection = await amqp.connect(this.uri)
			this.channel = await this.connection.createChannel()

			await this.logger.writeAsync(
				`Connected to TransitionServer, waiting for messages...`,
				ansiColorCodes.dim
			)
		} catch (error) {
			await this.logger.writeAsync(
				`Error connecting to TransitionServer: ${error}, please start RabbitMQ`,
				ansiColorCodes.red
			)
		}
	}

	async disconnect(): Promise<void> {
		if (this.channel) {
			await this.channel.close()
		}
		if (this.connection) {
			await this.connection.close()
		}
	}

	async send(queueName: string, message: string | Buffer): Promise<void> {
		if (!this.channel) {
			throw new Error("Cannot send message: Channel is not created")
		}
		await this.channel.assertQueue(queueName, { durable: true })
		this.channel.sendToQueue(
			queueName,
			typeof message === "string" ? Buffer.from(message) : message,
			{
				persistent: true,
			}
		)
	}

	async receive(
		queueName: string,
		onMessage: (msg: ConsumeMessage | null) => void
	): Promise<void> {
		if (!this.channel) {
			throw new Error("Cannot receive message: Channel is not created")
		}
		await this.channel.assertQueue(queueName, { durable: true })
		this.channel.consume(
			queueName,
			(msg) => {
				onMessage(msg)

				if (msg) {
					this.channel?.ack(msg)
				}
			},
			{ noAck: false }
		)
	}

	// Ajoutez d'autres méthodes selon vos besoins
}

export default TransitionManager
