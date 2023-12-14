import { AuthConfiguration } from "../breakEmu_Core/AuthConfiguration"
import Logger from "../breakEmu_Core/Logger"
import WorldServerData from "./WorldServerData"
import { Socket, createServer } from "net"
import ServerStatus from "../breakEmu_Auth/enum/ServerStatus"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Database from "../breakEmu_API/Database"
import WorldController from "../breakEmu_API/controller/world.controller"
import WorldServer from "./WorldServer"
import { AuthClient } from "../breakEmu_Auth/AuthClient"
import { GameServerInformations, ServerStatusEnum } from "../breakEmu_Server/IO"

class WorldServerManager {
	public logger: Logger = new Logger("WorldServerManager")

	private static _instance: WorldServerManager

	private SERVER_STATE: number = ServerStatus.Offline

	public allowedIps: string[] = ["127.0.0.1"]

	public _realmList: WorldServer[] = []

	public static getInstance(): WorldServerManager {
		if (!WorldServerManager._instance) {
			WorldServerManager._instance = new WorldServerManager()
		}

		return WorldServerManager._instance
	}

	public async initialize() {
		const servers = await new WorldController(this).getRealmList()
		this._realmList = servers as WorldServer[]
	}

	public gameServerInformationArray(
		client: AuthClient
	): GameServerInformations[] {
		const test = this._realmList
			.filter((server) => client.canAccessWorld(server))
			.map((server) => this.gameServerInformation(client, server))

		console.log(test)

		return test
	}

	public gameServerInformation(
		client: AuthClient,
		server: WorldServer
	): GameServerInformations {
		const charCount = 0

		const gameServerMessage = new GameServerInformations(
			server.worldServerData.IsMonoAccount,
			true,
			server.worldServerData.Id,
			1,
			ServerStatusEnum.OFFLINE,
			1,
			charCount,
			5,
			Date.now()
		)

		return gameServerMessage
	}
}

export default WorldServerManager
