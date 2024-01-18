import Character from "../../../breakEmu_API/model/character.model"
import { ansiColorCodes } from "../../../breakEmu_Core/Colors"
import Logger from "../../../breakEmu_Core/Logger"
import {
  CharacterCapabilitiesMessage,
  CharacterSelectedSuccessMessage,
  NotificationListMessage,
  SequenceNumberRequestMessage
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../../breakEmu_World/WorldClient"

class CharacterSelectionHandler {
	private static logger: Logger = new Logger("CharacterSelectionHandler")
	public static async handleCharacterSelectionMessage(
		character: Character,
		client: WorldClient
	) {
    this.logger.write(`CharacterSelectionHandler: ${character?.name}`, ansiColorCodes.bgMagenta)
    character.client = client
		await client.Send(
			client.serialize(
				new CharacterSelectedSuccessMessage(
					character?.toCharacterBaseInformations(),
					false
				)
			)
		)
		await client.Send(client.serialize(new NotificationListMessage([2147483647])))
		await client.Send(client.serialize(new CharacterCapabilitiesMessage(4095)))
		await client.Send(client.serialize(new SequenceNumberRequestMessage()))

		await character?.refreshJobs()
		await character?.refreshSpells()
		// character?.refreshGuild()
		await character?.refreshEmotes()
		await character?.refreshInventory()
		await character?.refreshShortcuts()
		await character?.sendServerExperienceModificator()

		client.selectedCharacter = character as Character

		await character?.onCharacterLoadingComplete()
	}
}

export default CharacterSelectionHandler