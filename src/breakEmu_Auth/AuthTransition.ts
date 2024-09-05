import { Connection, ConsumeMessage } from "amqplib"
import WorldController from "@breakEmu_API/controller/world.controller"
import Logger from "@breakEmu_Core/Logger"
import { ServerStatusUpdateMessage } from "@breakEmu_Protocol/IO"
import TransitionServer from "@breakEmu_Server/TransitionServer"
import WorldServerManager from "@breakEmu_World/WorldServerManager"
import AuthServer from "./AuthServer"
import Container from "@breakEmu_Core/container/Container"

class AuthTransition extends TransitionServer {
	logger: Logger = new Logger("AuthTransition")
	connection: Connection | null = null

	constructor(uri: string) {
		super(uri)
	}

	async handleServerStatusUpdateMessage(msg: string) {
		const message = JSON.parse(msg)
		const server = this.container
			.get(WorldController)
			.worldList.find((s) => s.worldServerData.Id === message.serverId)
		if (!server) return

		server.SERVER_STATE = message.status

		for (const client of this.container.get(AuthServer).GetClients()) {
			const gameServerMessage = await this.container
				.get(WorldServerManager)
				.gameServerInformation(server, client, message.status)
			const serverStatusUpdateMessage = new ServerStatusUpdateMessage(
				gameServerMessage
			)

			await client.Send(serverStatusUpdateMessage)
		}
	}

	public async sendAccountTransferMessage(pseudo: string, ipAddress: string): Promise<void> {
    //TODO: ENCRYPT THE DATA BEFORE SENDING
		this.logger.writeAsync(`accountTransfer: ${pseudo}`)
		const key = `accountTransfer:${pseudo}`
		await this.redisClient?.setex(key, 60, JSON.stringify({ pseudo: pseudo, ipAddress: ipAddress })) // Set key with 60 seconds expiry
	}

	public async startListeningForServerStatusUpdates(): Promise<void> {
		await this.subscribe("ServerStatusUpdateChannel", (message) => {
			this.handleServerStatusUpdateMessage(message)
		})
	}
}

export default AuthTransition
