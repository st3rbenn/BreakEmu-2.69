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
  GameMapMovementRequestMessage,
  GameMapMovementConfirmMessage,
  ChangeMapMessage,
  GameMapMovementCancelMessage,
  InteractiveUseRequestMessage,
  LeaveDialogRequestMessage,
  DofusMessage,
  TeleportRequestMessage,
  ZaapRespawnSaveRequestMessage,
  ChatClientMultiMessage,
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
import InteractiveMapHandler from "./handlers/map/interactive/InteractiveMapHandler"
import DialogHandler from "./handlers/dialog/DialogHandler"
import TeleportHandler from "./handlers/map/teleport/TeleportHandler"
import ChatCommandHandler from "./handlers/chat/ChatHandler"

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
  }

  private initializeMessageHandlers() {
    this.messageHandlers = {
      [AuthenticationTicketMessage.id]: AuthentificationHandler.handleAuthenticationTicketMessage.bind(AuthentificationHandler),
      [CharactersListRequestMessage.id]: CharacterListHandler.handleCharactersListMessage.bind(CharacterListHandler),
      [CharacterNameSuggestionRequestMessage.id]: RandomCharacterNameHandler.handleCharacterNameSuggestionRequestMessage.bind(RandomCharacterNameHandler),
      [ReloginTokenRequestMessage.id]: ServerListHandler.handleServerListRequestMessage.bind(ServerListHandler),
      [BasicPingMessage.id]: (client: WorldClient, message: DofusMessage) => client.Send(new BasicPongMessage(true)),
      [AllianceRanksRequestMessage.id]: (client: WorldClient, message: DofusMessage) => client.Send(new AllianceRanksMessage([])),
      [ServerSelectionMessage.id]: ServerListHandler.handleServerSelectionMessage.bind(ServerListHandler),
      [IgnoredGetListMessage.id]: async (client: WorldClient, message: DofusMessage) => console.log("IgnoredGetListMessage", message),
      [FriendsGetListMessage.id]: (client: WorldClient, message: DofusMessage) => client.Send(new FriendsListMessage([])),
      [FinishMoveListRequestMessage.id]: FinishmoveHandler.handleFinishMoveListRequestMessage.bind(FinishmoveHandler),

      // Utiliser une assertion de type pour 'message' dans les fonctions anonymes
      [CharacterCanBeCreatedRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          CharacterCreationHandler.CharacterCanBeCreatedRequestMessage(message as CharacterCanBeCreatedRequestMessage, client),
      [CharacterDeletionPrepareRequestMessage.id]: (client: WorldClient, message: DofusMessage) =>
          CharacterDeletionHandler.handleCharacterDeletionPrepareRequest(message as CharacterDeletionPrepareRequestMessage, client),
      [CharacterDeletionRequestMessage.id]: (client: WorldClient, message: DofusMessage) =>
          CharacterDeletionHandler.handleCharacterDeletionMessage(client, message as CharacterDeletionRequestMessage),
      [CharacterCreationRequestMessage.id]: (client: WorldClient, message: DofusMessage) =>
          CharacterCreationHandler.handleCharacterCreationRequestMessage(message as CharacterCreationRequestMessage, client),
      [CharacterFirstSelectionMessage.id]: (client: WorldClient, message: DofusMessage) =>
          CharacterSelectionHandler.handleCharacterSelectionMessage(client.selectedCharacter, client),
      [CharacterSelectionMessage.id]: (client: WorldClient, message: DofusMessage) => 
          CharacterSelectionHandler.handleCharacterSelectionMessage(client.account?.characters.get((message as CharacterSelectionMessage).id_ as number) as Character, client),
      [GameContextCreateRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          ContextHandler.handleGameContextCreateMessage(client.selectedCharacter as Character),
      [MapInformationsRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          MapHandler.handleMapInformationsRequestMessage(client, message as MapInformationsRequestMessage),
      [PlayerStatusUpdateRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          PlayerStatusHandler.handlePlayerStatusMessage(client, message as PlayerStatusUpdateRequestMessage),
      [FinishMoveSetRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          FinishmoveHandler.handleFinishMoveSetRequestMessage(client, message as FinishMoveSetRequestMessage),
      [ShortcutBarSwapRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          ShortcutHandler.handleShortcutBarSwapRequestMessage(client, message as ShortcutBarSwapRequestMessage),
      [ShortcutBarRemoveRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          ShortcutHandler.handleShortcutBarRemoveRequestMessage(client, message as ShortcutBarRemoveRequestMessage),
      [ShortcutBarAddRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          ShortcutHandler.handleShortcutBarAddRequestMessage(client, message as ShortcutBarAddRequestMessage),
      [ObjectSetPositionMessage.id]: (client: WorldClient, message: DofusMessage) => 
          InventoryHandler.handleObjectSetPositionMessage(client, message as ObjectSetPositionMessage),
      [AchievementAlmostFinishedDetailedListRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          AchievementHandler.handleAchievementAlmostFinishedDetailedListRequestMessage(client),
      [StatsUpgradeRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          StatsHandler.handlerStatsUpgradeRequestMessage(message as StatsUpgradeRequestMessage, client),
      [GameMapMovementRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          MapHandler.handleGameMapMovementRequestMessage(message as GameMapMovementRequestMessage, client),
      [GameMapMovementConfirmMessage.id]: (client: WorldClient, message: DofusMessage) => 
          MapHandler.handleMapMovementConfirmMessage(client),
      [GameMapMovementCancelMessage.id]: (client: WorldClient, message: DofusMessage) => 
          MapHandler.handleMapMovementCancelMessage(message as GameMapMovementCancelMessage, client),
      [ChangeMapMessage.id]: (client: WorldClient, message: DofusMessage) => 
          MapHandler.handleChangeMapMessage(message as ChangeMapMessage, client),
      [InteractiveUseRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          InteractiveMapHandler.handleInteractiveUse(message as InteractiveUseRequestMessage, client),
      [LeaveDialogRequestMessage.id]: (client: WorldClient, message: DofusMessage) => 
          DialogHandler.handleLeaveDialogRequestMessage(client, message as LeaveDialogRequestMessage),
      [TeleportRequestMessage.id]: (client: WorldClient, message: DofusMessage) =>
          TeleportHandler.handleTeleportRequestMessage(client, message as TeleportRequestMessage),
      [ZaapRespawnSaveRequestMessage.id]: (client: WorldClient, message: DofusMessage) =>
          TeleportHandler.handleZaapRespawnSaveRequestMessage(client, message as ZaapRespawnSaveRequestMessage),
      [ChatClientMultiMessage.id]: (client: WorldClient, message: DofusMessage) =>
          ChatCommandHandler.handleChatClientMultiMessage(client, message as ChatClientMultiMessage),
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
    try {
        if (ConfigurationManager.getInstance().showDebugMessages) {
            await this.logger.writeAsync(`Received data from ${socket.remoteAddress}: ${data.toString("hex")}`, ansiColorCodes.lightGray);
        }

        const message = this.deserialize(data);
        if (!message) return;

        if (ConfigurationManager.getInstance().showProtocolMessage) {
            await this.logger.writeAsync(`Deserialized dofus message '${messages[message.id].name}' from account: ${this.account?.pseudo}`, ansiColorCodes.lightGray);
        }

        const handler = this.messageHandlers[message.id];
        if (handler) {
            await handler(this, message);
        } else {
            await this.logger.writeAsync(`${messages[message.id].name} is not handled`, ansiColorCodes.red);
        }
    } catch (error) {
        await this.logger.writeAsync(`Error while handling data: ${(error as any).stack}`, ansiColorCodes.red);
    }
}

  public override async OnClose(): Promise<void> {
    await WorldServer.getInstance().removeClient(this)
  }

  // public async handleData(socket: Socket, data: Buffer): Promise<void> {
  //   if (ConfigurationManager.getInstance().showDebugMessages) {
  //     await this.logger.writeAsync(
  //       `Received data from ${socket.remoteAddress}: ${data.toString("hex")}`,
  //       ansiColorCodes.lightGray
  //     )
  //   }

  //   try {
  //     const message = this.deserialize(data)

  //     if (ConfigurationManager.getInstance().showProtocolMessage && message) {
  //       await this.logger.writeAsync(
  //         `Deserialized dofus message '${messages[message?.id as number].name
  //         }' from account: ${this.account?.pseudo}`,
  //         ansiColorCodes.lightGray
  //       )
  //     }

  //     switch (message?.id) {
  //       case AuthenticationTicketMessage.id:
  //         await AuthentificationHandler.handleAuthenticationTicketMessage(this)
  //         break
  //       case CharactersListRequestMessage.id:
  //         await CharacterListHandler.handleCharactersListMessage(this)
  //         break
  //       case CharacterCanBeCreatedRequestMessage.id:
  //         await CharacterCreationHandler.CharacterCanBeCreatedRequestMessage(
  //           message as CharacterCanBeCreatedRequestMessage,
  //           this
  //         )
  //         break
  //       case CharacterNameSuggestionRequestMessage.id:
  //         await RandomCharacterNameHandler.handleCharacterNameSuggestionRequestMessage(
  //           this
  //         )
  //         break
  //       case CharacterDeletionPrepareRequestMessage.id:
  //         await CharacterDeletionHandler.handleCharacterDeletionPrepareRequest(
  //           message as CharacterDeletionPrepareRequestMessage,
  //           this
  //         )
  //         break
  //       case CharacterDeletionRequestMessage.id:
  //         await CharacterDeletionHandler.handleCharacterDeletionMessage(
  //           this,
  //           message as CharacterDeletionRequestMessage
  //         )
  //         break
  //       case CharacterCreationRequestMessage.id:
  //         await CharacterCreationHandler.handleCharacterCreationRequestMessage(
  //           message as CharacterCreationRequestMessage,
  //           this
  //         )
  //         break
  //       case CharacterFirstSelectionMessage.id:
  //         await CharacterSelectionHandler.handleCharacterSelectionMessage(
  //           this.selectedCharacter as Character,
  //           this
  //         )
  //         break
  //       case CharacterSelectionMessage.id:
  //         const msg = message as CharacterSelectionMessage
  //         await CharacterSelectionHandler.handleCharacterSelectionMessage(
  //           this.account?.characters.get(msg.id_ as number) as Character,
  //           this
  //         )
  //         break
  //       case ReloginTokenRequestMessage.id:
  //         await ServerListHandler.handleServerListRequestMessage(this)
  //         break
  //       case ServerSelectionMessage.id:
  //         await ServerListHandler.handleServerSelectionMessage(this)
  //         await CharacterListHandler.handleCharactersListMessage(this)
  //         break
  //       case BasicPingMessage.id:
  //         await this.Send(this.serialize(new BasicPongMessage(true)))
  //         break
  //       case AllianceRanksRequestMessage.id:
  //         await this.Send(this.serialize(new AllianceRanksMessage([])))
  //         break
  //       case AllianceGetPlayerApplicationMessage.id:
  //         // await this.Send(this.serialize(new AlliancePlayerApplicationMessage()))
  //         break
  //       case IgnoredGetListMessage.id:
  //         console.log("IgnoredGetListMessage", message)
  //         break
  //       case GameContextCreateRequestMessage.id:
  //         await ContextHandler.handleGameContextCreateMessage(
  //           this.selectedCharacter as Character
  //         )
  //         break
  //       case FriendsGetListMessage.id:
  //         await this.Send(this.serialize(new FriendsListMessage([])))
  //         break
  //       case MapInformationsRequestMessage.id:
  //         await MapHandler.handleMapInformationsRequestMessage(
  //           this,
  //           message as MapInformationsRequestMessage
  //         )
  //         break
  //       case PlayerStatusUpdateRequestMessage.id:
  //         await PlayerStatusHandler.handlePlayerStatusMessage(
  //           this,
  //           message as PlayerStatusUpdateRequestMessage
  //         )
  //         break
  //       case FinishMoveListRequestMessage.id:
  //         let finishMoves: FinishMoveInformations[] = []

  //         this.selectedCharacter?.finishmoves?.forEach((fm) => {
  //           finishMoves.push(fm.toFinishMoveInformations())
  //         })

  //         this.Send(this.serialize(new FinishMoveListMessage(finishMoves)))
  //         break
  //       case ShortcutBarSwapRequestMessage.id:
  //         await ShortcutHandler.handleShortcutBarSwapRequestMessage(
  //           this,
  //           message as ShortcutBarSwapRequestMessage
  //         )
  //         break
  //       case ShortcutBarRemoveRequestMessage.id:
  //         await ShortcutHandler.handleShortcutBarRemoveRequestMessage(
  //           this,
  //           message as ShortcutBarRemoveRequestMessage
  //         )
  //         break
  //       case ShortcutBarAddRequestMessage.id:
  //         await ShortcutHandler.handleShortcutBarAddRequestMessage(
  //           this,
  //           message as ShortcutBarAddRequestMessage
  //         )
  //         break
  //       case FinishMoveSetRequestMessage.id:
  //         await FinishmoveHandler.handleFinishMoveSetRequestMessage(
  //           this,
  //           message as FinishMoveSetRequestMessage
  //         )
  //         break
  //       case ObjectSetPositionMessage.id:
  //         await InventoryHandler.handleObjectSetPositionMessage(
  //           this,
  //           message as ObjectSetPositionMessage
  //         )
  //         break
  //       case AchievementAlmostFinishedDetailedListRequestMessage.id:
  //         await AchievementHandler.handleAchievementAlmostFinishedDetailedListRequestMessage(
  //           this
  //         )
  //         break
  //       case StatsUpgradeRequestMessage.id:
  //         await StatsHandler.handlerStatsUpgradeRequestMessage(
  //           message as StatsUpgradeRequestMessage,
  //           this
  //         )
  //         break
  //       case GameMapMovementRequestMessage.id:
  //         await MapHandler.handleGameMapMovementRequestMessage(
  //           message as GameMapMovementRequestMessage,
  //           this
  //         )
  //         break
  //       case GameMapMovementConfirmMessage.id:
  //         await MapHandler.handleMapMovementConfirmMessage(this)
  //         break
  //       case GameMapMovementCancelMessage.id:
  //         await MapHandler.handleMapMovementCancelMessage(message as GameMapMovementCancelMessage, this)
  //         break;
  //       case ChangeMapMessage.id:
  //         await MapHandler.handleChangeMapMessage(
  //           message as ChangeMapMessage,
  //           this
  //         )
  //         break
  //       case InteractiveUseRequestMessage.id:
  //         await InteractiveMapHandler.handleInteractiveUse(
  //           message as InteractiveUseRequestMessage,
  //           this
  //         )
  //         break;
  //       case LeaveDialogRequestMessage.id:
  //         await DialogHandler.handleLeaveDialogRequestMessage(this, message as LeaveDialogRequestMessage)
  //         break;
  //       default:
  //         await this.logger.writeAsync(
  //           `${messages[message?.id as number].name} is not handled`,
  //           ansiColorCodes.red
  //         )
  //         break
  //     }
  //   } catch (error) {
  //     await this.logger.writeAsync(
  //       `Error while handling data: ${(error as any).stack}`,
  //       ansiColorCodes.red
  //     )
  //   }
  // }
}

export default WorldClient
