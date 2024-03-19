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
		try {
			let characters = client.account?.characters

			let characterToBaseInfo: CharacterBaseInformations[] = []

			this.logger.write(
				`Sending: ${characters?.size} characters for client: ${client.account?.username}`,
				ansiColorCodes.bgYellow
			)

			if (characters) {
				characters.forEach((c: Character) => {
					characterToBaseInfo.push(c.toCharacterBaseInformations())
				})
			} else {
				this.logger.write(
					`No characters found for account ${client.account?.username}`,
					ansiColorCodes.bgYellow
				)
			}

			await client.Send(
				new CharactersListMessage(characterToBaseInfo)
			)
		} catch (error) {
			await this.logger.writeAsync(
				`Error while handling CharactersListMessage: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}
}

export default CharacterListHandler
