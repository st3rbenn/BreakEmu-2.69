import Account from "@breakEmu_API/model/account.model"
import {
	ReloginTokenStatusMessage,
	SelectedServerDataMessage,
	ServersListMessage,
} from "@breakEmu_Protocol/IO"
import WorldServerManager from "@breakEmu_World/WorldServerManager"
import WorldClient from "../../WorldClient"
import WorldServer from "../../WorldServer"
import CharacterHandler from "../character/CharacterHandler"
import Container from "@breakEmu_Core/container/Container"

class ServerListHandler {
	private static container: Container = Container.getInstance()
	public static async handleServerListRequestMessage(client: WorldClient) {

		const reloginTokenStatusMessage = new ReloginTokenStatusMessage(
			false,
			client.token.toString()
		)

		await client.Send(reloginTokenStatusMessage)

		const gameServerInformationArray = await this.container
			.get(WorldServerManager)
			.gameServerInformation(
				this.container.get(WorldServer),
				client.account as Account
			)

		await client.Send(
			new ServersListMessage([gameServerInformationArray], true)
		)
	}

	public static async handleServerSelectionMessage(client: WorldClient) {

		const selectedServerDataMessage = new SelectedServerDataMessage(
			this.container.get(WorldServer).worldServerData?.Id,
			this.container.get(WorldServer).worldServerData?.Address,
			[this.container.get(WorldServer).worldServerData?.Port as number, 5555],
			true,
			client.token
		)

		await client.Send(selectedServerDataMessage)
		await CharacterHandler.handleCharactersListMessage(client)
	}
}

export default ServerListHandler
