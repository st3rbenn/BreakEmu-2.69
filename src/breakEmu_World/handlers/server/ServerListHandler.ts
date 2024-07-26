import Account from "../../../breakEmu_API/model/account.model"
import {
	ReloginTokenStatusMessage,
	SelectedServerDataMessage,
	ServersListMessage,
} from "../../../breakEmu_Server/IO"
import WorldServerManager from "../../../breakEmu_World/WorldServerManager"
import WorldClient from "../../WorldClient"
import WorldServer from "../../WorldServer"
import CharacterHandler from "../character/CharacterHandler"

class ServerListHandler {
	public static async handleServerListRequestMessage(client: WorldClient) {
		const token: number[] = Buffer.from(
			[...Array(32)].map(() => Math.random().toString(36)[2]).join("")
		).toJSON().data

		const reloginTokenStatusMessage = new ReloginTokenStatusMessage(
			false,
			token.toString()
		)

		await client.Send(reloginTokenStatusMessage)

		const gameServerInformationArray = await WorldServerManager.getInstance().gameServerInformation(
			WorldServer.getInstance(),
			client.account as Account
		)

		await client.Send(
			new ServersListMessage([gameServerInformationArray], true)
		)
	}

	public static async handleServerSelectionMessage(client: WorldClient) {
		const token: number[] = Buffer.from(
			[...Array(32)].map(() => Math.random().toString(36)[2]).join("")
		).toJSON().data

		const selectedServerDataMessage = new SelectedServerDataMessage(
			WorldServer.getInstance().worldServerData?.Id,
			WorldServer.getInstance().worldServerData?.Address,
			[WorldServer.getInstance().worldServerData?.Port as number, 5555],
			true,
			token
		)

		await client.Send(selectedServerDataMessage)
    await CharacterHandler.handleCharactersListMessage(client)
	}
}

export default ServerListHandler
