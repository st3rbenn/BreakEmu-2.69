import Database from "./breakEmu_API/Database"
import World from "./breakEmu_API/model/world.model"
import { ansiColorCodes } from "./breakEmu_Core/Colors"
import Logger from "./breakEmu_Core/Logger"
import ConfigurationManager from "./breakEmu_Core/configuration/ConfigurationManager"
import { ServerStatusEnum } from "./breakEmu_Server/IO"
import WorldServer from "./breakEmu_World/WorldServer"
import WorldServerManager from "./breakEmu_World/WorldServerManager"
import WorldTransition from "./breakEmu_World/WorldTransition"
import CommandHandler from "./breakEmu_World/handlers/chat/command/CommandHandler"

class Main {
	public logger: Logger = new Logger("Main")

	async Start(): Promise<void> {
		await this.logger.onStartup()
		await ConfigurationManager.getInstance().Load()
		await WorldTransition.getInstance().connect()
		await WorldTransition.getInstance().handleServerStatusUpdate(
			292,
			ServerStatusEnum.STARTING.toString()
		)

		CommandHandler.loadCommandHandlers()

		const dbInit = await Database.getInstance().initialize(true)
		if (dbInit) {
			const worldServerData = World.worlds[0].toWorldServerData()
			await WorldServer.getInstance(worldServerData).Start()
		}

		await this.logger.writeAsync(`Server started!`, ansiColorCodes.bgGreen)
	}
}

new Main().Start()

process.on("SIGINT", async () => {
	await WorldTransition.getInstance().handleServerStatusUpdate(
		World.worlds[0].toWorldServerData().Id,
		ServerStatusEnum.OFFLINE.toString()
	)
	await WorldServerManager.getInstance()._realmList[0].Stop()
	await Database.getInstance().prisma.$disconnect()
	await WorldTransition.getInstance().disconnect()
	process.exit(0)
})

// setInterval(() => {
//   const memoryUsage = process.memoryUsage();

//   console.log(`Memory usage: ${memoryUsage.rss / 1024 / 1024} MB`);
// }, 1000);
