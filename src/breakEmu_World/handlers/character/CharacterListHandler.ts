import {
	CharacterBaseInformations,
	CharactersListMessage,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../../breakEmu_World/WorldClient"

class CharacterListHandler {
	public static async handleCharactersListMessage(client: WorldClient) {
		let characters = client.account?.characters || []

		let characterToBaseInfo: CharacterBaseInformations[] = []

		for (const c of characters.values()) {
			characterToBaseInfo.push(c.toCharacterBaseInformations())
		}

		await client.Send(
			client.serialize(new CharactersListMessage(characterToBaseInfo))
		)
	}
}

export default CharacterListHandler
