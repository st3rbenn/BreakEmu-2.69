import { ansiColorCodes } from "../../breakEmu_Core/Colors"
import Logger from "../../breakEmu_Core/Logger"
import WorldServer from "../../breakEmu_World/WorldServer"
import WorldServerData from "../../breakEmu_World/WorldServerData"
import WorldServerManager from "../../breakEmu_World/WorldServerManager"
import Database from "../Database"
import BaseController from "./base.controller"
import TransitionServer from "../../breakEmu_Auth/TransitionServer"
import { AuthServer } from "../../breakEmu_Auth/AuthServer"
import { WorldRegistrationRequestMessage } from "../../breakEmu_Server/IO"

class WorldController extends BaseController {
	protected _logger: Logger = new Logger("worldController")
	public _database: Database = Database.getInstance()
	public worldList: WorldServer[] = []


  private static _instance: WorldController

  public static getInstance(): WorldController {
    if (!WorldController._instance) {
      WorldController._instance = new WorldController()
    }

    return WorldController._instance
  }


	public initialize(): void {
		throw new Error("Method not implemented.")
	}

	constructor(client?: WorldServerManager) {
		super(client || WorldServerManager.getInstance())
	}

	async getRealmList(): Promise<WorldServer[] | undefined> {
		try {
			const worlds = await this._database.prisma.world.findMany()

			if (!worlds) return []

			const data = new WorldServerData(
				worlds[0].id,
				worlds[0].address,
				worlds[0].port,
				worlds[0].name,
				worlds[0].charCapacity,
				worlds[0].requiredRole,
				true,
				worlds[0].serverSelectable,
				false
			)
			const worldServer = new WorldServer(data)
			this.worldList.push(worldServer)
			await this._logger.writeAsync(
				`Added world ${worldServer.worldServerData.Name} to realm list`,
				ansiColorCodes.lightGray
			)

			return this.worldList
		} catch (error) {
			await this._logger.writeAsync(
				`Error getting realm list: ${error}`,
				ansiColorCodes.red
			)
		}
	}
}

export default WorldController
