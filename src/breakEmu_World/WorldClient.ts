import UserController from "@breakEmu_API/controller/user.controller"
import Account from "@breakEmu_API/model/account.model"
import Character from "@breakEmu_API/model/character.model"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import { HelloGameMessage, ProtocolRequired } from "@breakEmu_Protocol/IO"
import ServerClient from "@breakEmu_Server/ServerClient"
import MessageHandlers from "@breakEmu_World/MessageHandlers"
import WorldServer from "@breakEmu_World/WorldServer"
import { Socket } from "net"

class WorldClient extends ServerClient {
	public logger: Logger = new Logger("WorldClient")

	account: Account
	pseudo = ""
	token: number[]

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
					this.container.get(ConfigurationManager).dofusProtocolVersion
				)
			)
			await this.Send(new HelloGameMessage())
      this.token = this.generateToken()
			this.Socket.on(
				"data",
				async (data) =>
					await this.container.get(MessageHandlers).handleData(data, this)
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
			await this.container.get(WorldServer).removeClient(this)
		} catch (error) {
			this.logger.write(
				`Error while closing client: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	public generateToken(): number[] {
		return Buffer.from(
			[...Array(32)].map(() => Math.random().toString(36)[2]).join("")
		).toJSON().data
	}
}

export default WorldClient
