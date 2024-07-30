import GameMap from "breakEmu_API/model/map.model"
import Character from "../../breakEmu_API/model/character.model"
import Logger from "../../breakEmu_Core/Logger"
import {
	GameContextEnum,
	TitlesAndOrnamentsListRequestMessage,
} from "../../breakEmu_Server/IO"
import WorldClient from "../../breakEmu_World/WorldClient"
import {
	AdminQuietCommandMessage,
	EmoteAddMessage,
	GameContextCreateMessage,
	OrnamentGainedMessage,
	OrnamentSelectedMessage,
	OrnamentSelectRequestMessage,
	TitleGainedMessage,
	TitlesAndOrnamentsListMessage,
	TitleSelectedMessage,
	TitleSelectRequestMessage,
} from "./../../breakEmu_Server/IO/network/protocol"
import AchievementHandler from "./achievement/AchievementHandler"

enum AdminQuietCommande {
	moveto = "moveto",
}

class ContextHandler {
	private static logger: Logger = new Logger("ContextHandler")
	public static async handleGameContextCreateMessage(client: WorldClient) {
		const character = client.selectedCharacter
		character.inGame = true

		const inFight = false // Assurez-vous que cette valeur est correctement déterminée

		try {
			if (inFight) {
				await character.destroyContext()
				await character.createContext(GameContextEnum.FIGHT)
			} else {
				await Promise.all([
					character.createContext(GameContextEnum.ROLE_PLAY),
          client.Send(new GameContextCreateMessage(character.context)),
				])
        await character.teleport(character.mapId, character.cellId)
        await AchievementHandler.handleAchievementListMessage(character)
        // character.refreshStats()
			}
		} catch (error) {
			this.logger.write(
				`Error while creating context for ${character.name}: ${
					(error as any).stack
				}`
			)
		}
	}

	public static async handleTitlesAndOrnamentsListRequestMessage(
		client: WorldClient,
		message: TitlesAndOrnamentsListRequestMessage
	) {
		try {
			await client.Send(
				new TitlesAndOrnamentsListMessage(
					client.selectedCharacter.knownTitles,
					client.selectedCharacter.knownOrnaments,
					client.selectedCharacter.activeTitle || 0,
					client.selectedCharacter.activeOrnament || 0
				)
			)
		} catch (error) {
			this.logger.write(
				`Error while sending TitlesAndOrnamentsListMessage: ${
					(error as any).stack
				}`,
				"red"
			)
		}
	}

	public static async handleNewEmote(client: WorldClient, emoteId: number) {
		try {
			await client.selectedCharacter.client?.Send(new EmoteAddMessage(emoteId))
			await client.selectedCharacter.refreshEmotes()
		} catch (error) {
			this.logger.write(
				`Error while sending EmoteAddMessage: ${(error as any).stack}`,
				"red"
			)
		}
	}

	public static async handleNewTitle(client: WorldClient, titleId: number) {
		try {
			await client.selectedCharacter.client?.Send(
				new TitleGainedMessage(titleId)
			)
		} catch (error) {
			this.logger.write(
				`Error while sending TitleGainedMessage: ${(error as any).stack}`,
				"red"
			)
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
			this.logger.write(
				`Error while sending OrnamentGainedMessage: ${(error as any).stack}`,
				"red"
			)
		}
	}

	public static async handleOrnamentSelectRequestMessage(
		client: WorldClient,
		message: OrnamentSelectRequestMessage
	) {
		try {
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
		} catch (error) {
			this.logger.write(
				`Error while sending OrnamentSelectedMessage: ${(error as any).stack}`,
				"red"
			)
		}
	}

	public static async handleTitleSelectRequestMessage(
		client: WorldClient,
		message: TitleSelectRequestMessage
	) {
		try {
			if (
				client.selectedCharacter.knownTitles.includes(message.titleId as number)
			) {
				client.selectedCharacter.activeTitle = message.titleId as number
				await client.Send(new TitleSelectedMessage(message.titleId as number))
				client.selectedCharacter.createHumanOptions()
				await client.selectedCharacter.refreshActorOnMap()
			}
		} catch (error) {
			this.logger.write(
				`Error while sending TitleSelectedMessage: ${(error as any).stack}`,
				"red"
			)
		}
	}

	public static async handleAdminQuietCommandMessage(
		client: WorldClient,
		message: AdminQuietCommandMessage
	) {
		const parsedCommand = this.parseAdminCommand(message.content as string)

		try {
			switch (parsedCommand.commande) {
				case AdminQuietCommande.moveto:
					await client.selectedCharacter?.teleport(
						parseInt(parsedCommand.value[0])
					)
					break
				default:
					this.logger.write(
						`Unknown AdminQuietCommande: ${message.content}`,
						"red"
					)
			}
		} catch (error) {
			this.logger.write(
				`Error while handling AdminQuietCommandMessage: ${
					(error as any).stack
				}`,
				"red"
			)
		}
	}

	private static parseAdminCommand(adminCommand: string) {
		let returnObj: { commande: string; value: string[] } = {
			commande: "",
			value: [],
		}

		const splittedCommand = adminCommand.split(" ")
		returnObj.commande = splittedCommand[0]
		returnObj.value = splittedCommand.slice(1)

		return returnObj
	}
}

export default ContextHandler
