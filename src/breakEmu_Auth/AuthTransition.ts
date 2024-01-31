import { Connection, ConsumeMessage } from "amqplib"
import WorldController from "../breakEmu_API/controller/world.controller"
import Logger from "../breakEmu_Core/Logger"
import { ServerStatusUpdateMessage } from "../breakEmu_Server/IO"
import TransitionServer from "../breakEmu_Server/TransitionServer"
import WorldServerManager from "../breakEmu_World/WorldServerManager"
import AuthServer from "./AuthServer"

class AuthTransition extends TransitionServer {
	logger: Logger = new Logger("AuthTransition")
	connection: Connection | null = null

	private static _instance: AuthTransition

	public static getInstance(): AuthTransition {
		if (!AuthTransition._instance) {
			AuthTransition._instance = new AuthTransition(
				process.env.REDIS_URI as string
			)
		}

		return AuthTransition._instance
	}

	constructor(uri: string) {
		super(uri)
	}

	public async handleMessagesForAuth() {
		const msg = await this.receive("ServerStatusUpdateMessage")

    await this.handleServerStatusUpdateMessage(msg as string)

		// await this.receive(
		// 	"RequestForWorldListMessage",
		// 	async (msg: string | null) => {
		// 		// Traiter le message ici
		// 		if (msg) {
		// 			await this.handleRequestForWorldList(msg)
		// 		}
		// 	}
		// )

		// La méthode reste en écoute pour de nouveaux messages
	}

	async handleServerStatusUpdateMessage(msg: string) {
		const message = JSON.parse(msg)
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
