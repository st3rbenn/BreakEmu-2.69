import Character from "../../../breakEmu_API/model/character.model"
import { ansiColorCodes } from "../../../breakEmu_Core/Colors"
import Logger from "../../../breakEmu_Core/Logger"
import {
	CharacterBaseInformations,
	CharactersListMessage,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../../breakEmu_World/WorldClient"

class CharacterListHandler {
	private static logger: Logger = new Logger("CharacterListHandler")

	public static async handleCharactersListMessage(client: WorldClient) {
		let characters = client.account?.characters as Map<number, Character>

		let characterToBaseInfo: CharacterBaseInformations[] = []

		this.logger.write(
			`Sending ${characters?.size} characters to client ${client.account?.username}`,
			ansiColorCodes.bgYellow
		)

		characters.forEach((c: Character) => {
			characterToBaseInfo.push(c.toCharacterBaseInformations())
		})

		client.Send(
			client.serialize(new CharactersListMessage(characterToBaseInfo))
		)
	}
}

export default CharacterListHandler
