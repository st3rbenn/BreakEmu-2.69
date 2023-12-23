import CharacterController from "../breakEmu_API/controller/character.controller"
import WorldController from "../breakEmu_API/controller/world.controller"
import { AuthClient } from "../breakEmu_Auth/AuthClient"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import {
	BinaryBigEndianReader,
	DofusMessage,
	DofusNetworkMessage,
	GameServerInformations,
	messages,
} from "../breakEmu_Server/IO"
import WorldServer from "./WorldServer"
class WorldServerManager {
	public logger: Logger = new Logger("WorldServerManager")

	private static _instance: WorldServerManager

	public constructor() {}

	public allowedIps: string[] = ["127.0.0.1"]

	public _realmList: WorldServer[] = []

	public static getInstance(): WorldServerManager {
		if (!WorldServerManager._instance) {
			WorldServerManager._instance = new WorldServerManager()
		}

		return WorldServerManager._instance
	}

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
		const gsif = WorldController.getInstance()
			.worldList.filter((server) => client.canAccessWorld(server))
			.map(async (server) => await this.gameServerInformation(client, server))

		return Promise.all(gsif)
	}

	public async gameServerInformation(
		client: AuthClient,
		server: WorldServer,
		status?: number
	): Promise<GameServerInformations> {
		const charCount = await CharacterController.getInstance().getCharactersByAccountId(
			client.account?.id || 0
		)

		const gameServerMessage = new GameServerInformations(
			server.worldServerData?.IsMonoAccount,
			server.worldServerData?.IsSelectable,
			server.worldServerData?.Id,
			0,
			status || server.SERVER_STATE,
			1,
			charCount?.length,
			5,
			new Date().getTime()
		)

		return gameServerMessage
	}
}

export default WorldServerManager
