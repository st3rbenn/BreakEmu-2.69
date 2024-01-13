import Character from "../../../breakEmu_API/model/character.model"
import Logger from "../../../breakEmu_Core/Logger"
import {
	CharacterCapabilitiesMessage,
	CharacterLoadingCompleteMessage,
	CharacterSelectedSuccessMessage,
	CharacterSelectionMessage,
	NotificationListMessage,
	SequenceNumberRequestMessage,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../../breakEmu_World/WorldClient"

class CharacterSelectionHandler {
	private static logger: Logger = new Logger("CharacterSelectionHandler")
	public static async handleCharacterSelectionMessage(
		message: CharacterSelectionMessage,
		client: WorldClient
	) {
		const character = client.account?.characters.get(message.id_ as number)

		client.Send(
			client.serialize(
				new CharacterSelectedSuccessMessage(
					character?.toCharacterBaseInformations(),
					false
				)
			)
		)
		client.Send(client.serialize(new NotificationListMessage([2147483647])))
		client.Send(client.serialize(new CharacterCapabilitiesMessage(4095)))
		client.Send(client.serialize(new SequenceNumberRequestMessage()))

		character?.refreshJobs(client)
		character?.refreshSpells(client)
		// character?.refreshGuild(client)
		character?.refreshEmotes(client)
		character?.refreshInventory(client)
		character?.refreshShortcuts(client)
		character?.sendServerExperienceModificator(client)
		character?.onCharacterLoadingComplete(client)

		client.selectedCharacter = character as Character
	}
}

export default CharacterSelectionHandler
