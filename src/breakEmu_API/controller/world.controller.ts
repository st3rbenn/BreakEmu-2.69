import WorldServerData from "../../breakEmu_World/WorldServerData"
import { AuthClient } from "../../breakEmu_Auth/AuthClient"
import Logger from "../../breakEmu_Core/Logger"
import WorldServer from "../../breakEmu_World/WorldServer"
import WorldServerManager from "../../breakEmu_World/WorldServerManager"
import Database from "../Database"
import BaseController from "./base.controller"

class WorldController extends BaseController {
	protected _logger: Logger = new Logger("worldController")
	public _database: Database = Database.getInstance()
	public initialize(): void {
		throw new Error("Method not implemented.")
	}

	constructor(client: WorldServerManager) {
		super(client)
	}

	async getRealmList(): Promise<WorldServer[] | undefined> {
		try {
			const worlds = await this._database.prisma.world.findMany()

			if (!worlds) return []

			const worldList: WorldServer[] = []

			for (const world of worlds) {
				const data = new WorldServerData(
					world.id,
					world.address,
					world.port,
					world.name,
					world.charCapacity,
					world.requiredRole,
					true,
					false
				)
				const worldServer = new WorldServer(data)
				worldList.push(worldServer)
			}

			return worldList
		} catch (error) {
			await this._logger.writeAsync(`Error getting realm list: ${error}`, "red")
		}
	}
}

export default WorldController
