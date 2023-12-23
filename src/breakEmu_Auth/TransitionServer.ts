import amqp, { Channel, Connection, ConsumeMessage } from "amqplib"
import WorldController from "../breakEmu_API/controller/world.controller"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import { ServerStatusUpdateMessage } from "../breakEmu_Server/IO"
import WorldServer from "../breakEmu_World/WorldServer"
import WorldServerData from "../breakEmu_World/WorldServerData"
import WorldServerManager from "../breakEmu_World/WorldServerManager"
import { AuthServer } from "./AuthServer"
import UserController from "../breakEmu_API/controller/user.controller"

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

	public async handleMessagesForAuth() {
		// Supposons que TransitionManager a une méthode pour écouter les messages
		await TransitionManager.getInstance().receive(
			"ServerStatusUpdateMessage",
			async (msg: ConsumeMessage | null) => {
				// Traiter le message ici
				if (msg) {
					// const message = this.deserialize(msg?.content)
					const message = JSON.parse(msg.content.toString())
					await this.logger.writeAsync(`ServerStatusUpdateMessage`)
					const server = WorldController.getInstance().worldList.find(
						(s) => s.worldServerData.Id === message.serverId
					)
					if (!server) return

					server.SERVER_STATE = message.status

					for (const client of AuthServer.getInstance().GetClients()) {
						const gameServerMessage = await WorldServerManager.getInstance().gameServerInformation(
							client,
							server,
							message.status
						)
						const serverStatusUpdateMessage = new ServerStatusUpdateMessage(
							gameServerMessage
						)

						await client.Send(client.serialize(serverStatusUpdateMessage))
					}
				}
			}
		)

		await TransitionManager.getInstance().receive(
			"RequestForWorldListMessage",
			async (msg: ConsumeMessage | null) => {
				// Traiter le message ici
				if (msg) {
					console.log("RequestForWorldListMessage")
					const serverList = WorldController.getInstance().worldList

					let listOfWorlds: any[] = []

					for (const server of serverList) {
						listOfWorlds.push(server.worldServerData)
					}

					await TransitionManager.getInstance().send(
						"worlds",
						JSON.stringify({
							messageId: 2590,
							content: listOfWorlds[0],
						})
					)
				}
			}
		)

		// La méthode reste en écoute pour de nouveaux messages
	}

	public async handleMessagesForWorld() {
		TransitionManager.getInstance().send("RequestForWorldListMessage", "")

		await TransitionManager.getInstance().receive(
			"worlds",
			(msg: ConsumeMessage | null) => {
				// Traiter le message ici
				if (msg) {
					this.handleRequestForlWorldList(msg)
				}
			}
		)

		await TransitionManager.getInstance().receive(
			"needServerStatus",
			async (msg: ConsumeMessage | null) => this.handleNeedServerStatus()
		)

		// La méthode reste en écoute pour de nouveaux messages
	}

	private async handleRequestForlWorldList(msg: ConsumeMessage) {
		const message = JSON.parse(msg.content.toString())
		this.logger.writeAsync(`worlds: ${JSON.stringify(message)}`)
		const filteredWorlds = WorldServerManager.getInstance()._realmList.filter(
			(w) => w.worldServerData.Id === message.content.id
		)
		if (filteredWorlds.length > 0) {
			await TransitionManager.getInstance().send(
				"worlds",
				JSON.stringify({
					messageId: 2590,
					content: filteredWorlds[0].worldServerData,
				})
			)
			return
		}
		const worldServerData = new WorldServerData(
			message.content.id,
			message.content.address,
			message.content.port,
			message.content.name,
			message.content.capacity,
			message.content.requiredRole,
			message.content.isMonoAccount,
			message.content.isSelectable,
			message.content.requireSubscription
		)
		const worldServer = new WorldServer(worldServerData)
		await worldServer.Start()

		WorldServerManager.getInstance()._realmList.push(worldServer)
	}

	private async handleNeedServerStatus() {
		await TransitionManager.getInstance().send(
			"ServerStatusUpdateMessage",
			JSON.stringify({
				serverId: WorldServerManager.getInstance()._realmList[0]
					?.worldServerData.Id,
				status: WorldServerManager.getInstance()._realmList[0]?.SERVER_STATE.toString(),
			})
		)
	}

	public async sendAccountTransferMessage(pseudo: string) {
		this.logger.writeAsync(`accountTransfer: ${pseudo}`)
		await TransitionManager.getInstance().send(
			"accountTransfer",
			JSON.stringify({
				pseudo,
			})
		)
	}

	// Ajoutez d'autres méthodes selon vos besoins
}

export default TransitionManager
