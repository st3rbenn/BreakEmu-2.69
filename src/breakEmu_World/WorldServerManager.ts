import CharacterController from "@breakEmu_API/controller/character.controller"
import WorldController from "@breakEmu_API/controller/world.controller"
import Account from "@breakEmu_API/model/account.model"
import Character from "@breakEmu_API/model/character.model"
import AuthClient from "@breakEmu_Auth/AuthClient"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import {
	BinaryBigEndianReader,
	DofusMessage,
	DofusNetworkMessage,
	GameServerInformations,
	messages,
} from "@breakEmu_Protocol/IO"
import WorldServer from "@breakEmu_World/WorldServer"
import Container from "@breakEmu_Core/container/Container"

class WorldServerManager {
	public logger: Logger = new Logger("WorldServerManager")

	private container: Container = Container.getInstance()

	public constructor() {}

	public allowedIps: string[] = ["127.0.0.1"]

	public _realmList: WorldServer[] = []

	public deserialize(data: Buffer): DofusMessage {
		const reader = new BinaryBigEndianReader({
			maxBufferLength: data.length,
		}).writeBuffer(data)

		const {
			messageId,
			instanceId,
			payloadSize,
		} = DofusNetworkMessage.readHeader(reader)
		if (!(messageId in messages)) {
			this.logger.writeAsync(
				`Undefined message (id: ${messageId})`,
				ansiColorCodes.red
			)
		}

		const message = new messages[messageId]()
		message.deserialize(reader)

		return message
	}

	public async gameServerInformationArray(
		client: AuthClient
	): Promise<GameServerInformations[]> {
		const gsif = this.container
			.get(WorldController)
			.worldList.filter((server) => client.canAccessWorld(server))
			.map(
				async (server) =>
					await this.gameServerInformation(server, client.account)
			)

		return Promise.all(gsif)
	}

	public async gameServerInformation(
		server: WorldServer,
		account: Account,
		status?: number
	): Promise<GameServerInformations> {
		let charCount: number = 0

		charCount = await this.container
			.get(CharacterController)
			.countCharacterByAccountId(account.id)

		const gameServerMessage = new GameServerInformations(
			server.worldServerData?.IsMonoAccount,
			server.worldServerData?.IsSelectable,
			server.worldServerData?.Id,
			0,
			status || server.SERVER_STATE,
			1,
			charCount,
			5,
			new Date().getTime()
		)

		return gameServerMessage
	}
}

export default WorldServerManager
