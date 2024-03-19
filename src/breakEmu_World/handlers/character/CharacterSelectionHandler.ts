import Character from "../../../breakEmu_API/model/character.model"
import { ansiColorCodes } from "../../../breakEmu_Core/Colors"
import Logger from "../../../breakEmu_Core/Logger"
import {
	CharacterCapabilitiesMessage,
	CharacterSelectedSuccessMessage,
	NotificationListMessage,
	SequenceNumberRequestMessage,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../../breakEmu_World/WorldClient"

class CharacterSelectionHandler {
	private static logger: Logger = new Logger("CharacterSelectionHandler")
	public static async handleCharacterSelectionMessage(
		character: Character,
		client: WorldClient
	) {
		character.client = client
		await client.Send(
			new CharacterSelectedSuccessMessage(
        character?.toCharacterBaseInformations(),
        false
      )
		)
		await client.Send(
      new NotificationListMessage([2147483647])
		)
		await client.Send(new CharacterCapabilitiesMessage(4095))
		await client.Send(new SequenceNumberRequestMessage())

		client.selectedCharacter = character as Character

		await character?.refreshAll()

		// await character.inventory?.addNewItem(8464, 1, false)
	}
}

export default CharacterSelectionHandler
