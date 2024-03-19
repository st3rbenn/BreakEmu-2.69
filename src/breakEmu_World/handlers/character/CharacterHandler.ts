import Character from "../../../breakEmu_API/model/character.model"
import {
	CharacterLevelUpInformationMessage,
	CharacterLevelUpMessage,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../WorldClient"

class CharacterHandler {
	public static async sendCharacterLevelUpMessage(
		client: WorldClient,
		currentLevel: number
	) {
		await client.Send(
			new CharacterLevelUpMessage(currentLevel)
		)
	}

	public static async sendCharacterLevelUpInformationMessage(
		client: WorldClient,
		character: Character,
		currentLevel: number
	) {
		await client.Send(
			new CharacterLevelUpInformationMessage(
        currentLevel,
        character.name,
        character.id
      )
		)
	}
}

export default CharacterHandler
