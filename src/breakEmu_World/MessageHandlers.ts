import Character from "@breakEmu_API/model/character.model"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import Container from "@breakEmu_Core/container/Container"
import {
	AchievementAlmostFinishedDetailedListRequestMessage,
	AchievementDetailedListRequestMessage,
	AchievementDetailsRequestMessage,
	AchievementRewardRequestMessage,
	AdminQuietCommandMessage,
	AllianceRanksMessage,
	AllianceRanksRequestMessage,
	AuthenticationTicketMessage,
	BasicPingMessage,
	BasicPongMessage,
	ChangeMapMessage,
	CharacterCanBeCreatedRequestMessage,
	CharacterCreationRequestMessage,
	CharacterDeletionPrepareRequestMessage,
	CharacterDeletionRequestMessage,
	CharacterFirstSelectionMessage,
	CharacterNameSuggestionRequestMessage,
	CharacterSelectionMessage,
	CharactersListRequestMessage,
	ChatClientMultiMessage,
	ClientKeyMessage,
	DofusMessage,
	ExchangeBidHouseBuyMessage,
	ExchangeBidHouseSearchMessage,
	ExchangeBidHouseTypeMessage,
	ExchangeCraftCountRequestMessage,
	ExchangeObjectMoveKamaMessage,
	ExchangeObjectMoveMessage,
	ExchangeObjectTransfertAllFromInvMessage,
	ExchangeObjectTransfertAllToInvMessage,
	ExchangeObjectTransfertExistingFromInvMessage,
	ExchangeObjectTransfertExistingToInvMessage,
	ExchangeObjectTransfertListFromInvMessage,
	ExchangeObjectTransfertListToInvMessage,
	ExchangeReadyMessage,
	ExchangeSetCraftRecipeMessage,
	FinishMoveListRequestMessage,
	FinishMoveSetRequestMessage,
	FriendsGetListMessage,
	FriendsListMessage,
	GameContextCreateRequestMessage,
	GameMapMovementCancelMessage,
	GameMapMovementConfirmMessage,
	GameMapMovementRequestMessage,
	IgnoredGetListMessage,
	InteractiveUseRequestMessage,
	LeaveDialogRequestMessage,
	MapInformationsRequestMessage,
	NpcGenericActionRequestMessage,
	ObjectSetPositionMessage,
	OrnamentSelectRequestMessage,
	PlayerStatusUpdateRequestMessage,
	ReloginTokenRequestMessage,
	ReloginTokenStatusMessage,
	ServerSelectionMessage,
	ShortcutBarAddRequestMessage,
	ShortcutBarRemoveRequestMessage,
	ShortcutBarSwapRequestMessage,
	StatsUpgradeRequestMessage,
	TeleportRequestMessage,
	TitlesAndOrnamentsListRequestMessage,
	ZaapRespawnSaveRequestMessage,
	messages,
} from "@breakEmu_Protocol/IO"
import WorldClient from "./WorldClient"
import ContextHandler from "./handlers/ContextHandler"
import AchievementHandler from "./handlers/achievement/AchievementHandler"
import AuthentificationHandler from "./handlers/authentification/AuthentificationHandler"
import CharacterHandler from "./handlers/character/CharacterHandler"
import RandomCharacterNameHandler from "./handlers/character/RandomCharacterNameHandler"
import FinishmoveHandler from "./handlers/character/finishmove/FinishmoveHandler"
import InventoryHandler from "./handlers/character/inventory/InventoryHandler"
import PlayerStatusHandler from "./handlers/character/player/PlayerStatusHandler"
import ShortcutHandler from "./handlers/character/shortcut/ShortcutHandler"
import StatsHandler from "./handlers/character/stats/StatsHandler"
import ChatCommandHandler from "./handlers/chat/ChatHandler"
import DialogHandler from "./handlers/dialog/DialogHandler"
import MapHandler from "./handlers/map/mapHandler"
import InteractiveMapHandler from "./handlers/map/interactive/InteractiveMapHandler"
import TeleportHandler from "./handlers/map/teleport/TeleportHandler"
import ServerListHandler from "./handlers/server/ServerListHandler"
import NpcHandler from "./handlers/map/npc/NpcHandler"
import AuctionHouseHandler from "./manager/map/element/interactiveElement/AuctionHouseHandler"
import ContextExchangeHandler from "./handlers/exchange/ContextExchangeHandler"

class MessageHandlers {
	private logger = new Logger("MessageHandlers")
	private container: Container = Container.getInstance()

	constructor() {
		this.initializeMessageHandlers()
	}

	messageHandlers: {
		[id: number]: (client: WorldClient, message: DofusMessage) => Promise<void>
	}

	initializeMessageHandlers() {
		this.messageHandlers = {
			[AuthenticationTicketMessage.id]: AuthentificationHandler.handleAuthenticationTicketMessage.bind(
				AuthentificationHandler
			),
			[CharacterNameSuggestionRequestMessage.id]: RandomCharacterNameHandler.handleCharacterNameSuggestionRequestMessage.bind(
				RandomCharacterNameHandler
			),

			[ReloginTokenRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) => await client.Send(new ReloginTokenStatusMessage(false, "")),
			[ClientKeyMessage.id]: async () => {},
			[BasicPingMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) => {
				await client.Send(new BasicPongMessage(true))
				return
			},
			[AllianceRanksRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) => await client.Send(new AllianceRanksMessage([])),
			[ServerSelectionMessage.id]: ServerListHandler.handleServerSelectionMessage.bind(
				ServerListHandler
			),
			[IgnoredGetListMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) => console.log("IgnoredGetListMessage", message),
			[FriendsGetListMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) => await client.Send(new FriendsListMessage([])),
			[FinishMoveListRequestMessage.id]: FinishmoveHandler.handleFinishMoveListRequestMessage.bind(
				FinishmoveHandler
			),
			[CharactersListRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) => await CharacterHandler.handleCharactersListMessage(client),
			[CharacterCanBeCreatedRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await CharacterHandler.CharacterCanBeCreatedRequestMessage(
					message as CharacterCanBeCreatedRequestMessage,
					client
				),
			[CharacterDeletionPrepareRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await CharacterHandler.handleCharacterDeletionPrepareRequest(
					message as CharacterDeletionPrepareRequestMessage,
					client
				),
			[CharacterDeletionRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await CharacterHandler.handleCharacterDeletionMessage(
					client,
					message as CharacterDeletionRequestMessage
				),
			[CharacterCreationRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await CharacterHandler.handleCharacterCreationRequestMessage(
					message as CharacterCreationRequestMessage,
					client
				),
			[CharacterFirstSelectionMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await CharacterHandler.handleCharacterSelectionMessage(
					client.account?.characters.get(
						(message as CharacterSelectionMessage).id_ as number
					) as Character,
					client
				),
			[CharacterSelectionMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await CharacterHandler.handleCharacterSelectionMessage(
					client.account?.characters.get(
						(message as CharacterSelectionMessage).id_ as number
					) as Character,
					client
				),
			[GameContextCreateRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) => await ContextHandler.handleGameContextCreateMessage(client),
			[MapInformationsRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await MapHandler.handleMapInformationsRequestMessage(
					client,
					message as MapInformationsRequestMessage
				),
			[PlayerStatusUpdateRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await PlayerStatusHandler.handlePlayerStatusMessage(
					client,
					message as PlayerStatusUpdateRequestMessage
				),
			[FinishMoveSetRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await FinishmoveHandler.handleFinishMoveSetRequestMessage(
					client,
					message as FinishMoveSetRequestMessage
				),
			[ShortcutBarSwapRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await ShortcutHandler.handleShortcutBarSwapRequestMessage(
					client,
					message as ShortcutBarSwapRequestMessage
				),
			[ShortcutBarRemoveRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await ShortcutHandler.handleShortcutBarRemoveRequestMessage(
					client,
					message as ShortcutBarRemoveRequestMessage
				),
			[ShortcutBarAddRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await ShortcutHandler.handleShortcutBarAddRequestMessage(
					client,
					message as ShortcutBarAddRequestMessage
				),
			[ObjectSetPositionMessage.id]: async (
				client: WorldClient,
				message: ObjectSetPositionMessage
			) => {
				await InventoryHandler.handleObjectSetPositionMessage(
					client,
					message as ObjectSetPositionMessage
				)
			},
			[StatsUpgradeRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await StatsHandler.handlerStatsUpgradeRequestMessage(
					message as StatsUpgradeRequestMessage,
					client
				),
			[GameMapMovementRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await MapHandler.handleGameMapMovementRequestMessage(
					message as GameMapMovementRequestMessage,
					client
				),
			[GameMapMovementConfirmMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) => await MapHandler.handleMapMovementConfirmMessage(client),
			[GameMapMovementCancelMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await MapHandler.handleMapMovementCancelMessage(
					message as GameMapMovementCancelMessage,
					client
				),
			[ChangeMapMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await MapHandler.handleChangeMapMessage(
					message as ChangeMapMessage,
					client
				),
			[InteractiveUseRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await InteractiveMapHandler.handleInteractiveUse(
					message as InteractiveUseRequestMessage,
					client
				),
			[LeaveDialogRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await DialogHandler.handleLeaveDialogRequestMessage(
					client,
					message as LeaveDialogRequestMessage
				),
			[TeleportRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await TeleportHandler.handleTeleportRequestMessage(
					client,
					message as TeleportRequestMessage
				),
			[ZaapRespawnSaveRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await TeleportHandler.handleZaapRespawnSaveRequestMessage(
					client,
					message as ZaapRespawnSaveRequestMessage
				),
			[ChatClientMultiMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await ChatCommandHandler.handleChatClientMultiMessage(
					client,
					message as ChatClientMultiMessage
				),
			[AdminQuietCommandMessage.id]: async (
				client: WorldClient,
				message: AdminQuietCommandMessage
			) => await ContextHandler.handleAdminQuietCommandMessage(client, message),
			[AchievementRewardRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await AchievementHandler.handleAchievementRewardRequestMessage(
					client,
					message as AchievementRewardRequestMessage
				),
			[AchievementAlmostFinishedDetailedListRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await AchievementHandler.handleAchievementAlmostFinishedDetailedListRequestMessage(
					client
				),
			[AchievementDetailedListRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await AchievementHandler.handleAchievementDetailedListRequestMessage(
					client,
					message as AchievementDetailedListRequestMessage
				),
			[AchievementDetailsRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await AchievementHandler.handleAchievementDetailsRequestMessage(
					client,
					message as AchievementDetailsRequestMessage
				),
			[TitlesAndOrnamentsListRequestMessage.id]: async (
				client: WorldClient,
				message: DofusMessage
			) =>
				await ContextHandler.handleTitlesAndOrnamentsListRequestMessage(
					client,
					message
				),
			[OrnamentSelectRequestMessage.id]: async (
				client: WorldClient,
				message: OrnamentSelectRequestMessage
			) =>
				await ContextHandler.handleOrnamentSelectRequestMessage(
					client,
					message
				),
			[ExchangeSetCraftRecipeMessage.id]: async (
				client: WorldClient,
				message: ExchangeSetCraftRecipeMessage
			) =>
				await ContextExchangeHandler.handleExchangeSetCraftRecipeMessage(
					client,
					message
				),
			[ExchangeObjectMoveMessage.id]: async (
				client: WorldClient,
				message: ExchangeObjectMoveMessage
			) =>
				await ContextExchangeHandler.handleExchangeObjectMoveMessage(
					client,
					message
				),
			[ExchangeObjectTransfertListFromInvMessage.id]: async (
				client: WorldClient,
				message: ExchangeObjectTransfertListFromInvMessage
			) =>
				ContextExchangeHandler.handleExchangeObjectTransfertListFromInvMessage(
					client,
					message
				),
			[ExchangeObjectTransfertListToInvMessage.id]: async (
				client: WorldClient,
				message: ExchangeObjectTransfertListToInvMessage
			) =>
				ContextExchangeHandler.handleExchangeObjectTransfertListToInvMessage(
					client,
					message
				),
			[ExchangeObjectTransfertAllFromInvMessage.id]: async (
				client: WorldClient,
				message: ExchangeObjectTransfertAllFromInvMessage
			) =>
				ContextExchangeHandler.handleExchangeObjectTransfertAllFromInvMessage(
					client,
					message
				),
			[ExchangeObjectTransfertAllToInvMessage.id]: async (
				client: WorldClient,
				message: ExchangeObjectTransfertAllToInvMessage
			) =>
				ContextExchangeHandler.handleExchangeObjectTransfertAllToInvMessage(
					client,
					message
				),
			[ExchangeObjectTransfertExistingFromInvMessage.id]: async (
				client: WorldClient,
				message: ExchangeObjectTransfertExistingFromInvMessage
			) =>
				ContextExchangeHandler.handleExchangeObjectTransfertExistingFromInvMessage(
					client,
					message
				),
			[ExchangeObjectTransfertExistingToInvMessage.id]: async (
				client: WorldClient,
				message: ExchangeObjectTransfertExistingToInvMessage
			) =>
				ContextExchangeHandler.handleExchangeObjectTransfertExistingToInvMessage(
					client,
					message
				),
			[ExchangeCraftCountRequestMessage.id]: async (
				client: WorldClient,
				message: ExchangeCraftCountRequestMessage
			) =>
				await ContextExchangeHandler.handleExchangeCraftCountRequestMessage(
					client,
					message
				),
			[ExchangeObjectMoveKamaMessage.id]: async (
				client: WorldClient,
				message: ExchangeObjectMoveKamaMessage
			) =>
				await ContextExchangeHandler.handleExchangeObjectMoveKamaMessage(
					client,
					message
				),
			[ExchangeReadyMessage.id]: async (
				client: WorldClient,
				message: ExchangeReadyMessage
			) =>
				await ContextExchangeHandler.handleExchangeReadyMessage(
					client,
					message
				),
			[NpcGenericActionRequestMessage.id]: async (
				client: WorldClient,
				message: NpcGenericActionRequestMessage
			) =>
				await NpcHandler.handleNpcGenericActionRequestMessage(client, message),
			[ExchangeBidHouseTypeMessage.id]: async (
				client: WorldClient,
				message: ExchangeBidHouseTypeMessage
			) =>
				await AuctionHouseHandler.exchangeBidHouseTypeMessage(
					client.selectedCharacter,
					message
				),
			[ExchangeBidHouseSearchMessage.id]: async (
				client: WorldClient,
				message: ExchangeBidHouseSearchMessage
			) =>
				await AuctionHouseHandler.exchangeBidHouseSearchMessage(
					client.selectedCharacter,
					message
				),
			[ExchangeBidHouseBuyMessage.id]: async (
				client: WorldClient,
				message: ExchangeBidHouseBuyMessage
			) =>
				await AuctionHouseHandler.exchangeBidHouseBuyMessage(
					client.selectedCharacter,
					message
				),
		}
	}

	public async handleData(
		data: Buffer,
		worldClient: WorldClient
	): Promise<void> {
		try {
			if (this.container.get(ConfigurationManager).showDebugMessages) {
				this.logger.write(
					`Received data from ${
						worldClient.Socket.remoteAddress
					}: ${data.toString("hex")}`,
					ansiColorCodes.lightGray
				)
			}

			const message = worldClient.deserialize(data)
			if (!message) return

			if (this.container.get(ConfigurationManager).showProtocolMessage) {
				this.logger.write(
					`Deserialized dofus message '${
						messages[message.id].name
					}' from account: ${worldClient.account?.pseudo}`,
					ansiColorCodes.lightGray
				)
			}

			const handler = this.messageHandlers[message.id]
			if (handler) {
				await handler(worldClient, message)
			} else {
				this.logger.write(
					`Handler for message ${message.id} not found`,
					ansiColorCodes.red
				)
			}
		} catch (error) {
			this.logger.write(
				`Error while handling data: ${(error as any).stack} from account: ${
					worldClient.account?.pseudo
				}`,
				ansiColorCodes.red
			)
		}
	}
}

export default MessageHandlers
