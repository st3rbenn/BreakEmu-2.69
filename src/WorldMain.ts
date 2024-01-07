import Database from "./breakEmu_API/Database"
import World from "./breakEmu_API/model/world.model"
import { ansiColorCodes } from "./breakEmu_Core/Colors"
import Logger from "./breakEmu_Core/Logger"
import ConfigurationManager from "./breakEmu_Core/configuration/ConfigurationManager"
import WorldServer from "./breakEmu_World/WorldServer"
import WorldServerManager from "./breakEmu_World/WorldServerManager"
import WorldTransition from "./breakEmu_World/WorldTransition"

class Main {
	public logger: Logger = new Logger("Main")

	async Start(): Promise<void> {
		await this.logger.onStartup()
		await ConfigurationManager.getInstance().Load()
		await WorldTransition.getInstance().connect()
		// await WorldTransition.getInstance().handleMessagesForWorld()
		await Database.getInstance().initialize()
		await Database.getInstance().loadAll()
		await WorldServer.getInstance(World.worlds[0].toWorldServerData()).Start()

		await this.logger.writeAsync(`Server started!`, ansiColorCodes.bgGreen)
	}
}

new Main().Start()

process.on("SIGINT", async () => {
	await WorldServerManager.getInstance()._realmList[0].Stop()
	await Database.getInstance().prisma.$disconnect()
	await WorldTransition.getInstance().disconnect()
	process.exit()
})
