import Logger from "../../../breakEmu_Core/Logger"
import {
	AchievementListMessage,
	CharacterExperienceGainMessage,
	CharacterLoadingCompleteMessage,
	CharacterSelectedSuccessMessage,
	CharacterSelectionMessage,
	CharacterStatsListMessage,
	FriendsListMessage,
	GameContextCreateMessage,
	HavenBagRoomUpdateMessage,
	InventoryContentMessage,
	NotificationListMessage,
	QuestListMessage,
	ShortcutBarContentMessage,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../../breakEmu_World/WorldClient"

class CharacterSelectionHandler {
	private static logger: Logger = new Logger("CharacterSelectionHandler")
	public static async handleCharacterSelectionMessage(
		message: CharacterSelectionMessage,
		client: WorldClient
	) {
		const character = client.account?.characters.get(message.id_ as number)

		await client.Send(client.serialize(new CharacterStatsListMessage(character?.characterCharacteristicsInformations())))
		await client.Send(client.serialize(new ShortcutBarContentMessage(0, [])))
		await client.Send(client.serialize(new HavenBagRoomUpdateMessage(0, [])))
		await client.Send(
			client.serialize(new CharacterExperienceGainMessage(0, 0, 0, 0))
		)
		await client.Send(
			client.serialize(new NotificationListMessage([0x7fffffff]))
		)
		await client.Send(
			client.serialize(
				new CharacterSelectedSuccessMessage(
					character?.toCharacterBaseInformations(),
					false
				)
			)
		)
		await client.Send(client.serialize(new AchievementListMessage([])))
		await client.Send(client.serialize(new InventoryContentMessage([], 0)))
		await client.Send(client.serialize(new FriendsListMessage([])))
		await client.Send(client.serialize(new GameContextCreateMessage(1)))
		await client.Send(client.serialize(new QuestListMessage([], [], [], [])))
		await client.Send(client.serialize(new CharacterLoadingCompleteMessage()))
	}
}

export default CharacterSelectionHandler
