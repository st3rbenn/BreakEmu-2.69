import { Socket } from "net"
import UserController from "@breakEmu_API/controller/user.controller"
import Account from "@breakEmu_API/model/account.model"
import Character from "@breakEmu_API/model/character.model"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import {
	HelloGameMessage,
	ProtocolRequired,
	messages,
} from "@breakEmu_Protocol/IO"
import ServerClient from "@breakEmu_Server/ServerClient"
import MessageHandlers from "./MessageHandlers"
import WorldServer from "./WorldServer"

class WorldClient extends ServerClient {
	public logger: Logger = new Logger("WorldClient")

	account: Account
	pseudo = ""

	selectedCharacter: Character

	constructor(socket: Socket, pseudo: string) {
		super(socket)
		this.pseudo = pseudo
	}

	setSelectedCharacter(character: Character) {
		this.selectedCharacter = character
	}

	public async initialize(): Promise<void> {
		const userController = new UserController()
		try {
			this.account = (await userController.getAccountByNickname(
				this.pseudo,
				this
			)) as Account

			await this.Send(
				new ProtocolRequired(
					ConfigurationManager.getInstance().dofusProtocolVersion
				)
			)
			await this.Send(new HelloGameMessage())
			this.Socket.on(
				"data",
				async (data) =>
					await MessageHandlers.getInstance().handleData(data, this)
			)
		} catch (error) {
			await this.logger.writeAsync(
				`Error while initializing client: ${(error as any).message}`,
				ansiColorCodes.red
			)
		}
	}

	async OnClose(): Promise<void> {
		try {
			await WorldServer.getInstance().removeClient(this)
		} catch (error) {
			this.logger.write(
				`Error while closing client: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}
}

export default WorldClient
