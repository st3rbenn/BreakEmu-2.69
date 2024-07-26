import { Socket } from "net"
import UserController from "../breakEmu_API/controller/user.controller"
import Account from "../breakEmu_API/model/account.model"
import Character from "../breakEmu_API/model/character.model"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import {
  AchievementAlmostFinishedDetailedListRequestMessage,
  AchievementDetailedListRequestMessage,
  AchievementDetailsRequestMessage,
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
  DofusMessage,
  FinishMoveListRequestMessage,
  FinishMoveSetRequestMessage,
  FriendsGetListMessage,
  FriendsListMessage,
  GameContextCreateRequestMessage,
  GameMapMovementCancelMessage,
  GameMapMovementConfirmMessage,
  GameMapMovementRequestMessage,
  HaapiApiKeyRequestMessage,
  HelloGameMessage,
  IgnoredGetListMessage,
  InteractiveUseRequestMessage,
  LeaveDialogRequestMessage,
  MapInformationsRequestMessage,
  ObjectSetPositionMessage,
  PlayerStatusUpdateRequestMessage,
  ProtocolRequired,
  ReloginTokenRequestMessage,
  ServerSelectionMessage,
  ShortcutBarAddRequestMessage,
  ShortcutBarRemoveRequestMessage,
  ShortcutBarSwapRequestMessage,
  StatsUpgradeRequestMessage,
  TeleportRequestMessage,
  ZaapRespawnSaveRequestMessage,
  messages
} from "../breakEmu_Server/IO"
import ServerClient from "../breakEmu_Server/ServerClient"
import WorldServer from "./WorldServer"
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
import MapHandler from "./handlers/map/MapHandler"
import InteractiveMapHandler from "./handlers/map/interactive/InteractiveMapHandler"
import TeleportHandler from "./handlers/map/teleport/TeleportHandler"
import ServerListHandler from "./handlers/server/ServerListHandler"
import HaapiAPIHandler from "./handlers/haapi/HaapiAPIHandler"

class WorldClient extends ServerClient {
  public logger: Logger = new Logger("WorldClient")

  private messageHandlers: { [id: number]: (client: WorldClient, message: DofusMessage) => Promise<void> };

  account: Account
  pseudo = ""

  selectedCharacter: Character

  constructor(socket: Socket, pseudo: string) {
    super(socket)
    this.pseudo = pseudo

    this.initializeMessageHandlers();
    this.setupEventHandlers()
  }

  private initializeMessageHandlers() {
    this.messageHandlers = {
      [AuthenticationTicketMessage.id]: AuthentificationHandler.handleAuthenticationTicketMessage.bind(AuthentificationHandler),
      [CharacterNameSuggestionRequestMessage.id]: RandomCharacterNameHandler.handleCharacterNameSuggestionRequestMessage.bind(RandomCharacterNameHandler),
      [ReloginTokenRequestMessage.id]: ServerListHandler.handleServerListRequestMessage.bind(ServerListHandler),
      [BasicPingMessage.id]: async (client: WorldClient, message: DofusMessage) => await client.Send(new BasicPongMessage(true)),
      [AllianceRanksRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => await client.Send(new AllianceRanksMessage([])),
      [ServerSelectionMessage.id]: ServerListHandler.handleServerSelectionMessage.bind(ServerListHandler),
      [IgnoredGetListMessage.id]: async (client: WorldClient, message: DofusMessage) => console.log("IgnoredGetListMessage", message),
      [FriendsGetListMessage.id]: async (client: WorldClient, message: DofusMessage) => await client.Send(new FriendsListMessage([])),
      [FinishMoveListRequestMessage.id]: FinishmoveHandler.handleFinishMoveListRequestMessage.bind(FinishmoveHandler),

      // Utiliser une assertion de type pour 'message' dans les fonctions anonymes
      [CharactersListRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => await CharacterHandler.handleCharactersListMessage(client),
      [CharacterCanBeCreatedRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await CharacterHandler.CharacterCanBeCreatedRequestMessage(message as CharacterCanBeCreatedRequestMessage, client),
      [CharacterDeletionPrepareRequestMessage.id]: async (client: WorldClient, message: DofusMessage) =>
          await CharacterHandler.handleCharacterDeletionPrepareRequest(message as CharacterDeletionPrepareRequestMessage, client),
      [CharacterDeletionRequestMessage.id]: async (client: WorldClient, message: DofusMessage) =>
          await CharacterHandler.handleCharacterDeletionMessage(client, message as CharacterDeletionRequestMessage),
      [CharacterCreationRequestMessage.id]: async (client: WorldClient, message: DofusMessage) =>
          await CharacterHandler.handleCharacterCreationRequestMessage(message as CharacterCreationRequestMessage, client),
      [CharacterFirstSelectionMessage.id]: async (client: WorldClient, message: DofusMessage) =>
          await CharacterHandler.handleCharacterSelectionMessage(client.selectedCharacter, client),
      [CharacterSelectionMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await CharacterHandler.handleCharacterSelectionMessage(client.account?.characters.get((message as CharacterSelectionMessage).id_ as number) as Character, client),
      [GameContextCreateRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await ContextHandler.handleGameContextCreateMessage(client.selectedCharacter as Character),
      [MapInformationsRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await MapHandler.handleMapInformationsRequestMessage(client, message as MapInformationsRequestMessage),
      [PlayerStatusUpdateRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await PlayerStatusHandler.handlePlayerStatusMessage(client, message as PlayerStatusUpdateRequestMessage),
      [FinishMoveSetRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await FinishmoveHandler.handleFinishMoveSetRequestMessage(client, message as FinishMoveSetRequestMessage),
      [ShortcutBarSwapRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await ShortcutHandler.handleShortcutBarSwapRequestMessage(client, message as ShortcutBarSwapRequestMessage),
      [ShortcutBarRemoveRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await ShortcutHandler.handleShortcutBarRemoveRequestMessage(client, message as ShortcutBarRemoveRequestMessage),
      [ShortcutBarAddRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await ShortcutHandler.handleShortcutBarAddRequestMessage(client, message as ShortcutBarAddRequestMessage),
      [ObjectSetPositionMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await InventoryHandler.handleObjectSetPositionMessage(client, message as ObjectSetPositionMessage),
      [AchievementAlmostFinishedDetailedListRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await AchievementHandler.handleAchievementAlmostFinishedDetailedListRequestMessage(client),
      [AchievementDetailedListRequestMessage.id]: async (client: WorldClient, message: DofusMessage) =>
          await AchievementHandler.handleAchievementDetailedListRequestMessage(client, message as AchievementDetailedListRequestMessage),
      [AchievementDetailsRequestMessage.id] : async (client: WorldClient, message: DofusMessage) =>
          await AchievementHandler.handleAchievementDetailsRequestMessage(client, message as AchievementDetailsRequestMessage),
      [StatsUpgradeRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await StatsHandler.handlerStatsUpgradeRequestMessage(message as StatsUpgradeRequestMessage, client),
      [GameMapMovementRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await MapHandler.handleGameMapMovementRequestMessage(message as GameMapMovementRequestMessage, client),
      [GameMapMovementConfirmMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await MapHandler.handleMapMovementConfirmMessage(client),
      [GameMapMovementCancelMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await MapHandler.handleMapMovementCancelMessage(message as GameMapMovementCancelMessage, client),
      [ChangeMapMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await MapHandler.handleChangeMapMessage(message as ChangeMapMessage, client),
      [InteractiveUseRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await InteractiveMapHandler.handleInteractiveUse(message as InteractiveUseRequestMessage, client),
      [LeaveDialogRequestMessage.id]: async (client: WorldClient, message: DofusMessage) => 
          await DialogHandler.handleLeaveDialogRequestMessage(client, message as LeaveDialogRequestMessage),
      [TeleportRequestMessage.id]: async (client: WorldClient, message: DofusMessage) =>
          await TeleportHandler.handleTeleportRequestMessage(client, message as TeleportRequestMessage),
      [ZaapRespawnSaveRequestMessage.id]: async (client: WorldClient, message: DofusMessage) =>
          await TeleportHandler.handleZaapRespawnSaveRequestMessage(client, message as ZaapRespawnSaveRequestMessage),
      [ChatClientMultiMessage.id]: async (client: WorldClient, message: DofusMessage) =>
          await ChatCommandHandler.handleChatClientMultiMessage(client, message as ChatClientMultiMessage),
    };
}

  public async initialize(): Promise<void> {
    try {
      this.account = await new UserController().getAccountByNickname(
        this.pseudo,
        this
      ) as Account
      await this.Send(
        new ProtocolRequired(
          ConfigurationManager.getInstance().dofusProtocolVersion
        )
      )
      await this.Send(new HelloGameMessage())
      this.Socket.on(
        "data",
        async (data) => await this.handleData(data)
      )
    } catch (error) {
      await this.logger.writeAsync(
        `Error while initializing client: ${(error as any).message}`,
        ansiColorCodes.red
      )
    }
  }

  public async handleData(data: Buffer): Promise<void> {
    try {
        if (ConfigurationManager.getInstance().showDebugMessages) {
            this.logger.write(`Received data from ${this.Socket.remoteAddress}: ${data.toString("hex")}`, ansiColorCodes.lightGray);
        }

        const message = this.deserialize(data);
        if (!message) return;

        if (ConfigurationManager.getInstance().showProtocolMessage) {
            this.logger.write(`Deserialized dofus message '${messages[message.id].name}' from account: ${this.account?.pseudo}`, ansiColorCodes.lightGray);
        }

        const handler = this.messageHandlers[message.id];
        if (handler) {
            await handler(this, message);
        } else {
            this.logger.write(`Handler for message ${message.id} not found`, ansiColorCodes.red);
        }
    } catch (error) {
        this.logger.write(`Error while handling data: ${(error as any).stack} from account: ${this.account?.pseudo}`, ansiColorCodes.red);
    }
}

  public override async OnClose(): Promise<void> {
    await WorldServer.getInstance().removeClient(this)
  }
}

export default WorldClient
