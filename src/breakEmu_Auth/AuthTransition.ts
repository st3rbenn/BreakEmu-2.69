import { Connection, ConsumeMessage } from "amqplib"
import WorldController from "../breakEmu_API/controller/world.controller"
import Logger from "../breakEmu_Core/Logger"
import { ServerStatusUpdateMessage } from "../breakEmu_Server/IO"
import TransitionServer from "../breakEmu_Server/TransitionServer"
import WorldServerData from "../breakEmu_World/WorldServerData"
import WorldServerManager from "../breakEmu_World/WorldServerManager"
import AuthServer from "./AuthServer"

class AuthTransition extends TransitionServer {
	logger: Logger = new Logger("AuthTransition")
	connection: Connection | null = null

	private static _instance: AuthTransition

	public static getInstance(): AuthTransition {
		if (!AuthTransition._instance) {
			AuthTransition._instance = new AuthTransition(
				process.env.RABBITMQ_URI as string
			)
		}

		return AuthTransition._instance
	}

	constructor(uri: string) {
		super(uri)
	}

	public async handleMessagesForAuth() {
		// Supposons que TransitionServer a une méthode pour écouter les messages
		await this.receive(
			"ServerStatusUpdateMessage",
			async (msg: ConsumeMessage | null) => {
				// Traiter le message ici
				if (msg) {
					// const message = this.deserialize(msg?.content)
					await this.handleServerStatusUpdateMessage(msg)
				}
			}
		)

		await this.receive(
			"RequestForWorldListMessage",
			async (msg: ConsumeMessage | null) => {
				// Traiter le message ici
				if (msg) {
					await this.handleRequestForWorldList(msg)
				}
			}
		)

		// La méthode reste en écoute pour de nouveaux messages
	}

	async handleServerStatusUpdateMessage(msg: ConsumeMessage) {
		const message = JSON.parse(msg.content.toString())
		await this.logger.writeAsync(`ServerStatusUpdateMessage`)
		const server = WorldController.getInstance().worldList.find(
			(s) => s.worldServerData.Id === message.serverId
		)
		if (!server) return

		server.SERVER_STATE = message.status

		for (const client of AuthServer.getInstance().GetClients()) {
			const gameServerMessage = await WorldServerManager.getInstance().gameServerInformation(
				server,
				client,
				message.status
			)
			const serverStatusUpdateMessage = new ServerStatusUpdateMessage(
				gameServerMessage
			)

			await client.Send(client.serialize(serverStatusUpdateMessage))
		}
	}

	async handleRequestForWorldList(msg: ConsumeMessage) {
		// this.logger.write("RequestForWorldListMessage")
		// const serverList = WorldController.getInstance().worldList

		// let listOfWorlds: WorldServerData[] = []

		// for (const server of serverList) {
		// 	listOfWorlds.push(server.worldServerData)
		// }

		// await this.send(
		// 	"worlds",
		// 	JSON.stringify({
		// 		messageId: 2590,
		// 		content: listOfWorlds[0],
		// 	})
		// )
	}

	public async sendAccountTransferMessage(pseudo: string, token?: string) {
		this.logger.writeAsync(`accountTransfer: ${pseudo}`)
		await this.send(
			"accountTransfer",
			JSON.stringify({
				pseudo,
			})
		)
	}
}

export default AuthTransition
