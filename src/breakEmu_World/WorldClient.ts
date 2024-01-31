import { Socket } from "net"
import UserController from "../breakEmu_API/controller/user.controller"
import Account from "../breakEmu_API/model/account.model"
import Character from "../breakEmu_API/model/character.model"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import {
	AchievementAlmostFinishedDetailedListRequestMessage,
	AllianceGetPlayerApplicationMessage,
	AllianceRanksMessage,
	AllianceRanksRequestMessage,
	AuthenticationTicketMessage,
	BasicPingMessage,
	BasicPongMessage,
	CharacterCanBeCreatedRequestMessage,
	CharacterCanBeCreatedResultMessage,
	CharacterCreationRequestMessage,
	CharacterDeletionPrepareRequestMessage,
	CharacterDeletionRequestMessage,
	CharacterFirstSelectionMessage,
	CharacterNameSuggestionRequestMessage,
	CharacterSelectionMessage,
	CharactersListRequestMessage,
	FinishMoveInformations,
	FinishMoveListMessage,
	FinishMoveListRequestMessage,
	FinishMoveSetRequestMessage,
	FriendsGetListMessage,
	FriendsListMessage,
	GameContextCreateRequestMessage,
	HelloGameMessage,
	IgnoredGetListMessage,
	MapInformationsRequestMessage,
	ObjectSetPositionMessage,
	PlayerStatusUpdateRequestMessage,
	PopupWarningClosedMessage,
	ProtocolRequired,
	ReloginTokenRequestMessage,
	ServerSelectionMessage,
	ShortcutBarAddRequestMessage,
	ShortcutBarRemoveRequestMessage,
	ShortcutBarSwapRequestMessage,
	StatsUpgradeRequestMessage,
	messages,
} from "../breakEmu_Server/IO"
import ServerClient from "../breakEmu_Server/ServerClient"
import WorldServer from "./WorldServer"
import ContextHandler from "./handlers/ContextHandler"
import AchievementHandler from "./handlers/achievement/AchievementHandler"
import AuthentificationHandler from "./handlers/authentification/AuthentificationHandler"
import CharacterCreationHandler from "./handlers/character/CharacterCreationHandler"
import CharacterDeletionHandler from "./handlers/character/CharacterDeletionHandler"
import CharacterListHandler from "./handlers/character/CharacterListHandler"
import CharacterSelectionHandler from "./handlers/character/CharacterSelectionHandler"
import RandomCharacterNameHandler from "./handlers/character/RandomCharacterNameHandler"
import FinishmoveHandler from "./handlers/character/finishmove/FinishmoveHandler"
import PlayerStatusHandler from "./handlers/character/player/PlayerStatusHandler"
import ShortcutHandler from "./handlers/character/shortcut/ShortcutHandler"
import MapHandler from "./handlers/map/MapHandler"
import ServerListHandler from "./handlers/server/ServerListHandler"
import InventoryHandler from "./handlers/character/inventory/InventoryHandler"
import StatsHandler from "./handlers/character/stats/StatsHandler"

class WorldClient extends ServerClient {
	public logger: Logger = new Logger("WorldClient")

	private _account: Account

	private _selectedCharacter: Character | null = null

	private _pseudo: string
	constructor(socket: Socket, pseudo: string) {
		super(socket)
		this.load(pseudo)
	}

	private async load(pseudo: string) {
		this._account = (await new UserController().getAccountByNickname(
			pseudo,
			this
		)) as Account
	}

	public async initialize(): Promise<void> {
		try {
			await this.Send(
				this.serialize(
					new ProtocolRequired(
						ConfigurationManager.getInstance().dofusProtocolVersion
					)
				)
			)
			await this.Send(this.serialize(new HelloGameMessage()))
			this.Socket.on(
				"data",
				async (data) => await this.handleData(this.Socket, data)
			)
		} catch (error) {
			await this.logger.writeAsync(
				`Error while initializing client: ${(error as any).message}`,
				ansiColorCodes.red
			)
		}
	}

	public async handleData(socket: Socket, data: Buffer): Promise<void> {
		if (ConfigurationManager.getInstance().showDebugMessages) {
			await this.logger.writeAsync(
				`Received data from ${socket.remoteAddress}: ${data.toString("hex")}`,
				ansiColorCodes.lightGray
			)
		}

		try {
			const message = this.deserialize(data)

			if (ConfigurationManager.getInstance().showProtocolMessage && message) {
				await this.logger.writeAsync(
					`Deserialized dofus message '${
						messages[message?.id as number].name
					}' from account: ${this.account?.pseudo}`,
					ansiColorCodes.lightGray
				)
			}

			switch (message?.id) {
				case AuthenticationTicketMessage.id:
					await AuthentificationHandler.handleAuthenticationTicketMessage(this)
					break
				case CharactersListRequestMessage.id:
					await CharacterListHandler.handleCharactersListMessage(this)
					break
				case CharacterCanBeCreatedRequestMessage.id:
					await this.Send(
						this.serialize(new CharacterCanBeCreatedResultMessage(true))
					)
					await this.Send(this.serialize(new PopupWarningClosedMessage()))
					break
				case CharacterNameSuggestionRequestMessage.id:
					await RandomCharacterNameHandler.handleCharacterNameSuggestionRequestMessage(
						this
					)
					break
				case CharacterDeletionPrepareRequestMessage.id:
					await CharacterDeletionHandler.handleCharacterDeletionPrepareRequest(
						message as CharacterDeletionPrepareRequestMessage,
						this
					)
					break
				case CharacterDeletionRequestMessage.id:
					await CharacterDeletionHandler.handleCharacterDeletionMessage(
						this,
						message as CharacterDeletionRequestMessage
					)
					break
				case CharacterCreationRequestMessage.id:
					await CharacterCreationHandler.handleCharacterCreationRequestMessage(
						message as CharacterCreationRequestMessage,
						this
					)
					break
				case CharacterFirstSelectionMessage.id:
					await CharacterSelectionHandler.handleCharacterSelectionMessage(
						this.selectedCharacter as Character,
						this
					)
					break
				case CharacterSelectionMessage.id:
					const msg = message as CharacterSelectionMessage
					await CharacterSelectionHandler.handleCharacterSelectionMessage(
						this.account?.characters.get(msg.id_ as number) as Character,
						this
					)
					break
				case ReloginTokenRequestMessage.id:
					await ServerListHandler.handleServerListRequestMessage(this)
					break
				case ServerSelectionMessage.id:
					await ServerListHandler.handleServerSelectionMessage(this)
					await CharacterListHandler.handleCharactersListMessage(this)
					break
				case BasicPingMessage.id:
					await this.Send(this.serialize(new BasicPongMessage(true)))
					break
				case AllianceRanksRequestMessage.id:
					await this.Send(this.serialize(new AllianceRanksMessage([])))
					break
				case AllianceGetPlayerApplicationMessage.id:
					// await this.Send(this.serialize(new AlliancePlayerApplicationMessage()))
					break
				case IgnoredGetListMessage.id:
					console.log("IgnoredGetListMessage", message)
					break
				case GameContextCreateRequestMessage.id:
					await ContextHandler.handleGameContextCreateMessage(
						this.selectedCharacter as Character
					)
					break
				case FriendsGetListMessage.id:
					await this.Send(this.serialize(new FriendsListMessage([])))
					break
				case MapInformationsRequestMessage.id:
					await MapHandler.handleMapInformationsRequestMessage(
						this,
						message as MapInformationsRequestMessage
					)
					break
				case PlayerStatusUpdateRequestMessage.id:
					await PlayerStatusHandler.handlePlayerStatusMessage(
						this,
						message as PlayerStatusUpdateRequestMessage
					)
					break
				case FinishMoveListRequestMessage.id:
					let finishMoves: FinishMoveInformations[] = []

					this.selectedCharacter?.finishMoves?.forEach((fm) => {
						finishMoves.push(fm.toFinishMoveInformations())
					})

					this.Send(this.serialize(new FinishMoveListMessage(finishMoves)))
					break
				case ShortcutBarSwapRequestMessage.id:
					await ShortcutHandler.handleShortcutBarSwapRequestMessage(
						this,
						message as ShortcutBarSwapRequestMessage
					)
					break
				case ShortcutBarRemoveRequestMessage.id:
					await ShortcutHandler.handleShortcutBarRemoveRequestMessage(
						this,
						message as ShortcutBarRemoveRequestMessage
					)
					break
				case ShortcutBarAddRequestMessage.id:
					await ShortcutHandler.handleShortcutBarAddRequestMessage(
						this,
						message as ShortcutBarAddRequestMessage
					)
					break
				case FinishMoveSetRequestMessage.id:
					await FinishmoveHandler.handleFinishMoveSetRequestMessage(
						this,
						message as FinishMoveSetRequestMessage
					)
					break
				case ObjectSetPositionMessage.id:
					await InventoryHandler.handleObjectSetPositionMessage(
						this,
						message as ObjectSetPositionMessage
					)
					break
				case AchievementAlmostFinishedDetailedListRequestMessage.id:
					await AchievementHandler.handleAchievementAlmostFinishedDetailedListRequestMessage(
						this
					)
					break
				case StatsUpgradeRequestMessage.id:
					await StatsHandler.handlerStatsUpgradeRequestMessage(
						message as StatsUpgradeRequestMessage,
						this
					)
					break
				default:
					await this.logger.writeAsync(
						`${messages[message?.id as number].name} is not handled`,
						ansiColorCodes.red
					)
					break
			}
		} catch (error) {
			await this.logger.writeAsync(
				`Error while handling data: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	public get account(): Account | null {
		return this._account
	}

	public set account(account: Account) {
		this._account = account
	}

	public get selectedCharacter(): Character | null {
		return this._selectedCharacter
	}

	public set selectedCharacter(character: Character | null) {
		this._selectedCharacter = character
	}

	public OnClose(): void {
		this.Socket.destroy()
		WorldServer.getInstance().RemoveClient(this)
	}
}

export default WorldClient
