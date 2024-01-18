import { Socket } from "net"
import Account from "../breakEmu_API/model/account.model"
import Character from "../breakEmu_API/model/character.model"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import {
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
	FriendsGetListMessage,
	FriendsListMessage,
	GameContextCreateRequestMessage,
	HelloGameMessage,
	IgnoredGetListMessage,
	MapInformationsRequestMessage,
	PopupWarningClosedMessage,
	ProtocolRequired,
	ReloginTokenRequestMessage,
	ServerSelectionMessage,
	messages,
} from "../breakEmu_Server/IO"
import ServerClient from "../breakEmu_Server/ServerClient"
import WorldServer from "./WorldServer"
import ContextHandler from "./handlers/ContextHandler"
import AuthentificationHandler from "./handlers/authentification/AuthentificationHandler"
import CharacterCreationHandler from "./handlers/character/CharacterCreationHandler"
import CharacterDeletionHandler from "./handlers/character/CharacterDeletionHandler"
import CharacterListHandler from "./handlers/character/CharacterListHandler"
import CharacterSelectionHandler from "./handlers/character/CharacterSelectionHandler"
import RandomCharacterNameHandler from "./handlers/character/RandomCharacterNameHandler"
import ServerListHandler from "./handlers/server/ServerListHandler"
import MapHandler from "./handlers/map/MapHandler"

class WorldClient extends ServerClient {
	public logger: Logger = new Logger("WorldClient")

	private _account: Account

	private _selectedCharacter: Character | null = null

	constructor(socket: Socket, account: Account) {
		super(socket)
		this._account = account

		WorldServer.getInstance().AddClient(this)
		this.setupEventHandlers()
		this.initialize()
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
    } catch (error: unknown | any) {
      await this.logger.writeAsync(
        `Error while initializing client: ${error.message}`,
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
					const cfsm = message as CharacterFirstSelectionMessage
					await CharacterSelectionHandler.handleCharacterSelectionMessage(
						this.account?.characters.get(cfsm.id_ as number) as Character,
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
					// await this.Send(this.serialize(new AllianceRanksMessage([])))
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
				default:
					await this.logger.writeAsync(
						`${messages[message?.id as number].name} is not handled`,
						ansiColorCodes.red
					)
					break
			}
		} catch (error: unknown | any) {
			await this.logger.writeAsync(
				`Error while handling data: ${error.stack}`,
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
