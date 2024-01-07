import { Socket } from "net"
import CharacterController from "../breakEmu_API/controller/character.controller"
import Account from "../breakEmu_API/model/account.model"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import {
	AcquaintancesGetListMessage,
	AcquaintancesListMessage,
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
	HelloGameMessage,
	PopupWarningClosedMessage,
	ProtocolRequired,
	ReloginTokenRequestMessage,
	ServerSelectionMessage,
	SpouseGetInformationsMessage,
	SpouseInformationsMessage,
	messages,
} from "../breakEmu_Server/IO"
import ServerClient from "../breakEmu_Server/ServerClient"
import WorldTransition from "../breakEmu_World/WorldTransition"
import WorldServer from "./WorldServer"
import AuthentificationHandler from "./handlers/authentification/AuthentificationHandler"
import CharacterListHandler from "./handlers/character/CharacterListHandler"
import RandomCharacterNameHandler from "./handlers/character/RandomCharacterNameHandler"
import CharacterDeletionHandler from "./handlers/character/CharacterDeletionHandler"
import CharacterCreationHandler from "./handlers/character/CharacterCreationHandler"
import CharacterSelectionHandler from "./handlers/character/CharacterSelectionHandler"
import ServerListHandler from "./handlers/server/ServerListHandler"

class WorldClient extends ServerClient {
	public logger: Logger = new Logger("WorldClient")

	private _account: Account | null = null

	public constructor(socket: Socket) {
		super(socket)
		WorldTransition.getInstance().handleAccountTransition(this)
	}

	public async initialize(): Promise<void> {
		await this.Send(
			this.serialize(
				new ProtocolRequired(
					ConfigurationManager.getInstance().dofusProtocolVersion
				)
			)
		)
		await this.Send(this.serialize(new HelloGameMessage()))
		this.Socket.on("data", (data) => this.handleData(this.Socket, data))
	}

	public OnClose(): void {
		WorldServer.getInstance().RemoveClient(this)
	}

	public async handleData(socket: Socket, data: Buffer): Promise<void> {
		if (ConfigurationManager.getInstance().showDebugMessages) {
			await this.logger.writeAsync(
				`Received data from ${socket.remoteAddress}: ${data.toString("hex")}`,
				ansiColorCodes.lightGray
			)
		}

		const message = this.deserialize(data)

		if (ConfigurationManager.getInstance().showProtocolMessage) {
			await this.logger.writeAsync(
				`Deserialized dofus message '${
					messages[message.id].name
				}' from account: ${this.account?.pseudo}`,
				ansiColorCodes.lightGray
			)
		}

		switch (message.id) {
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
				console.log("CharacterFirstSelectionMessage", message)
				await CharacterSelectionHandler.handleCharacterSelectionMessage(
					message as CharacterSelectionMessage,
					this
				)
				break
			case CharacterSelectionMessage.id:
				await CharacterSelectionHandler.handleCharacterSelectionMessage(
					message as CharacterSelectionMessage,
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
			case FriendsGetListMessage.id:
				await this.Send(this.serialize(new FriendsListMessage([])))
				break
			case AcquaintancesGetListMessage.id:
				await this.Send(this.serialize(new AcquaintancesListMessage([])))
				break
      case AllianceRanksRequestMessage.id: 
        await this.Send(this.serialize(new AllianceRanksMessage([])))
        break
      case SpouseGetInformationsMessage.id:
        // await this.Send(this.serialize(new SpouseInformationsMessage()))
        break
      case AllianceGetPlayerApplicationMessage.id:
        // await this.Send(this.serialize(new AlliancePlayerApplicationMessage()))
        break

			default:
				await this.logger.writeAsync(
					`Received unknown message: ${message.id}`,
					ansiColorCodes.red
				)
				break
		}
	}

	public get account(): Account | null {
		return this._account
	}

	public set account(account: Account | null) {
		this._account = account
	}
}

export default WorldClient
