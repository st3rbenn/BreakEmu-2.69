import {
	ExchangeObjectMoveKamaMessage,
	NpcGenericActionRequestMessage,
} from "./../../breakEmu_Protocol/IO/network/protocol"
import Recipe from "@breakEmu_API/model/recipe.model"
import Logger from "@breakEmu_Core/Logger"
import {
	GameContextEnum,
	TitlesAndOrnamentsListRequestMessage,
} from "@breakEmu_Protocol/IO"
import CraftExchange from "@breakEmu_World/manager/dialog/job/CraftExchange"
import Exchange from "@breakEmu_World/manager/exchange/Exchange"
import WorldClient from "@breakEmu_World/WorldClient"
import {
	AdminQuietCommandMessage,
	EmoteAddMessage,
	ExchangeCraftCountModifiedMessage,
	ExchangeCraftCountRequestMessage,
	ExchangeObjectMoveMessage,
	ExchangeReadyMessage,
	ExchangeSetCraftRecipeMessage,
	GameContextCreateMessage,
	OrnamentGainedMessage,
	OrnamentSelectedMessage,
	OrnamentSelectRequestMessage,
	TitleGainedMessage,
	TitlesAndOrnamentsListMessage,
	TitleSelectedMessage,
	TitleSelectRequestMessage,
} from "@breakEmu_Protocol/IO/network/protocol"
import AchievementHandler from "./achievement/AchievementHandler"
import Container from "@breakEmu_Core/container/Container"
import CharacterItemController from "@breakEmu_API/controller/characterItem.controller"
import BankExchange from "@breakEmu_World/manager/exchange/BankExchange"

enum AdminQuietCommande {
	moveto = "moveto",
}

class ContextHandler {
	private static logger: Logger = new Logger("ContextHandler")
	private static container: Container = Container.getInstance()

	static async handleGameContextCreateMessage(client: WorldClient) {
		const character = client.selectedCharacter
		const inFight = false

		try {
			if (inFight) {
				await character.destroyContext()
				await character.createContext(GameContextEnum.FIGHT)
			} else {
				await Promise.all([
					character.createContext(GameContextEnum.ROLE_PLAY),
					AchievementHandler.handleAchievementListMessage(character),
					character.refreshStats(),
				])
				await character.teleport(character.mapId, character.cellId)
				character.inGame = true
			}
		} catch (error) {
			this.logger.write(
				`Error while creating context for ${character.name}: ${
					(error as any).stack
				}`
			)
		}
	}

	static async handleTitlesAndOrnamentsListRequestMessage(
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

	static async handleNewEmote(client: WorldClient, emoteId: number) {
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

	static async handleNewTitle(client: WorldClient, titleId: number) {
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

	static async handleNewOrnament(client: WorldClient, ornamentId: number) {
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

	static async handleOrnamentSelectRequestMessage(
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

	static async handleTitleSelectRequestMessage(
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

	static async handleAdminQuietCommandMessage(
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

		console.log(
			`Parsed command: ${returnObj.commande} value: ${returnObj.value}`
		)
		return returnObj
	}
}

export default ContextHandler
