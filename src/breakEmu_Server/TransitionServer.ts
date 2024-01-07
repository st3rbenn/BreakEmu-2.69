import amqp, { Channel, Connection, ConsumeMessage } from "amqplib"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"

abstract class TransitionServer {
	abstract logger: Logger
	abstract connection: Connection | null
	private channel: Channel | null = null
	private readonly uri: string

	constructor(uri: string) {
		this.uri = uri
	}

	async connect(): Promise<void> {
		try {
			this.connection = await amqp.connect(this.uri)
			this.channel = await this.connection.createChannel()

			this.logger.write(
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

export default TransitionServer
