import Database from "./breakEmu_API/Database"
import TransitionServer from "./breakEmu_Auth/TransitionServer"
import { ansiColorCodes } from "./breakEmu_Core/Colors"
import Logger from "./breakEmu_Core/Logger"
import ConfigurationManager from "./breakEmu_Core/configuration/ConfigurationManager"
import WorldServerManager from "./breakEmu_World/WorldServerManager"

class Main {
	public logger: Logger = new Logger("Main")

	constructor() {
		this.Start()
	}

	async Start(): Promise<void> {
		await this.logger.onStartup()
		await ConfigurationManager.getInstance().Load()
		await Database.getInstance().initialize()
		await TransitionServer.getInstance().connect()
		TransitionServer.getInstance().handleMessagesForWorld()

		await this.logger.writeAsync(`Server started!`, ansiColorCodes.bgGreen)
	}
}

process.on("SIGINT", async () => {
	WorldServerManager.getInstance()._realmList[0].Stop()
  await Database.getInstance().prisma.$disconnect()
	await TransitionServer.getInstance().disconnect()
	process.exit()
})

new Main()
