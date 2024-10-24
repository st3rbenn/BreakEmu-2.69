import WorldController from "@breakEmu_API/controller/world.controller"
import AuthClient from "@breakEmu_Auth/AuthClient"
import AuthTransition from "@breakEmu_Auth/AuthTransition"
import Logger from "@breakEmu_Core/Logger"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import Container from "@breakEmu_Core/container/Container"
import {
	SelectedServerDataMessage,
	SelectedServerRefusedMessage,
	ServersListMessage,
} from "@breakEmu_Protocol/IO"
import WorldServer from "@breakEmu_World/WorldServer"
import WorldServerManager from "@breakEmu_World/WorldServerManager"
import ServerConnectionErrorEnum from "@breakEmu_World/enum/ServerConnectionErrorEnum"
import ServerStatusEnum from "@breakEmu_World/enum/ServerStatusEnum"

class ServerListHandler {
	private static logger: Logger = new Logger("ServerListHandler")
	private static container: Container = Container.getInstance()

	static async handleServersListMessage(client: AuthClient): Promise<void> {
		if (this.container.get(ConfigurationManager).showProtocolMessage) {
			await this.logger.writeAsync("Sending ServersListMessage message")
		}

		const gameServerInformationArray = await this.container
			.get(WorldServerManager)
			.gameServerInformationArray(client)

		client.Send(new ServersListMessage(gameServerInformationArray, true))
	}

	static async handleServerSelectionMessage(client: AuthClient): Promise<void> {
		const server = this.container.get(WorldController).worldList

		if (server.length <= 0) {
			await client.Send(
				new SelectedServerRefusedMessage(
					server[0].worldServerData?.Id,
					ServerConnectionErrorEnum.SERVER_CONNECTION_ERROR_NO_REASON,
					0
				)
			)
			return
		}

		if (server[0].SERVER_STATE != ServerStatusEnum.ONLINE) {
			await client.Send(
				new SelectedServerRefusedMessage(
					server[0].worldServerData?.Id,
					ServerConnectionErrorEnum.SERVER_CONNECTION_ERROR_DUE_TO_STATUS,
					0
				)
			)
			return
		}

		if (
			(server[0].worldServerData?.RequiredRole as number) >
			(client.account?.role as number)
		) {
			await client.Send(
				new SelectedServerRefusedMessage(
					server[0].worldServerData?.Id,
					ServerConnectionErrorEnum.SERVER_CONNECTION_ERROR_ACCOUNT_RESTRICTED,
					0
				)
			)
			return
		}

		await this.sendSelectServerData(client, server[0])
	}

	static async sendSelectServerData(client: AuthClient, server: WorldServer) {
		if (!server || !client.canAccessWorld(server)) {
			return
		}

		const token: number[] = Buffer.from(
			[...Array(32)].map(() => Math.random().toString(36)[2]).join("")
		).toJSON().data

		const selectedServerDataMessage = new SelectedServerDataMessage(
			server.worldServerData?.Id,
			server.worldServerData?.Address,
			[server.worldServerData?.Port as number, 5555],
			true,
			token
		)

		await client.Send(selectedServerDataMessage)

		await this.container.get(AuthTransition).sendAccountTransferMessage(client)

		await client.disconnect()
	}
}

export default ServerListHandler
