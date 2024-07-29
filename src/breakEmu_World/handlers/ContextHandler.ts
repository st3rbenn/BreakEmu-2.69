import {
	EmoteAddMessage,
	OrnamentGainedMessage,
	OrnamentSelectedMessage,
	OrnamentSelectRequestMessage,
	TitleGainedMessage,
	TitlesAndOrnamentsListMessage,
	TitleSelectedMessage,
	TitleSelectRequestMessage,
} from "./../../breakEmu_Server/IO/network/protocol"
import WorldClient from "../../breakEmu_World/WorldClient"
import Character from "../../breakEmu_API/model/character.model"
import {
	GameContextEnum,
	TitlesAndOrnamentsListRequestMessage,
} from "../../breakEmu_Server/IO"
import AchievementHandler from "./achievement/AchievementHandler"

class ContextHandler {
	public static async handleGameContextCreateMessage(character: Character) {
		let inFight: boolean = false
    character.inGame = true

		if (inFight) {
			await character.destroyContext()
			await character.createContext(GameContextEnum.FIGHT)
		} else {
			await character.createContext(GameContextEnum.ROLE_PLAY)

			await character.teleport(
				character.mapId as number,
				character.cellId as number
			)
			await AchievementHandler.handleAchievementListMessage(character)
      await character.refreshStats()
		}
	}

	public static async handleTitlesAndOrnamentsListRequestMessage(
		client: WorldClient,
		message: TitlesAndOrnamentsListRequestMessage
	) {
		await client.Send(
			new TitlesAndOrnamentsListMessage(
				client.selectedCharacter.knownTitles,
				client.selectedCharacter.knownOrnaments,
				client.selectedCharacter.activeTitle || 0,
				client.selectedCharacter.activeOrnament || 0
			)
		)
	}

	public static async handleNewEmote(client: WorldClient, emoteId: number) {
		try {
			await client.selectedCharacter.client?.Send(new EmoteAddMessage(emoteId))
			await client.selectedCharacter.refreshEmotes()
		} catch (error) {
			console.log(error)
		}
	}

	public static async handleNewTitle(client: WorldClient, titleId: number) {
		try {
			await client.selectedCharacter.client?.Send(
				new TitleGainedMessage(titleId)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public static async handleNewOrnament(
		client: WorldClient,
		ornamentId: number
	) {
		try {
			await client.selectedCharacter.client?.Send(
				new OrnamentGainedMessage(ornamentId)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public static async handleOrnamentSelectRequestMessage(
		client: WorldClient,
		message: OrnamentSelectRequestMessage
	) {
		if (
			client.selectedCharacter.knownOrnaments.includes(
				message.ornamentId as number
			)
		) {
			client.selectedCharacter.activeOrnament = message.ornamentId as number
			await client.Send(
				new OrnamentSelectedMessage(message.ornamentId as number)
			)
      client.selectedCharacter.createHumanOptions()
      await client.selectedCharacter.refreshActorOnMap()
		}
	}

	public static async handleTitleSelectRequestMessage(
		client: WorldClient,
		message: TitleSelectRequestMessage
	) {
		if (
			client.selectedCharacter.knownTitles.includes(message.titleId as number)
		) {
			client.selectedCharacter.activeTitle = message.titleId as number
			await client.Send(new TitleSelectedMessage(message.titleId as number))
      client.selectedCharacter.createHumanOptions()
      await client.selectedCharacter.refreshActorOnMap()
		}
	}
}

export default ContextHandler
