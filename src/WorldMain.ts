import { registerServices } from "@breakEmu_Core/container/service/ServiceRegistry"
import Database from "./breakEmu_API/Database"
import World from "./breakEmu_API/model/world.model"
import ansiColorCodes from "./breakEmu_Core/Colors"
import Logger from "./breakEmu_Core/Logger"
import ConfigurationManager from "./breakEmu_Core/configuration/ConfigurationManager"
import Container from "./breakEmu_Core/container/Container"
import { ServerStatusEnum } from "./breakEmu_Protocol/IO"
import WorldServer from "./breakEmu_World/WorldServer"
import WorldServerManager from "./breakEmu_World/WorldServerManager"
import WorldTransition from "./breakEmu_World/WorldTransition"
import CommandHandler from "./breakEmu_World/handlers/chat/command/CommandHandler"

class WorldMain {
	private container: Container

	constructor() {
		this.container = Container.getInstance()
		this.container.register(Logger, new Logger("Main"))
		registerServices(this.container)
	}

	async Start(): Promise<void> {
		const logger = this.container.get(Logger)
		await logger.onStartup()

		const configManager = this.container.get(ConfigurationManager)
		await configManager.Load()

		const worldTransition = this.container.get(WorldTransition)
		await worldTransition.connect()
		await worldTransition.handleServerStatusUpdate(
			292,
			ServerStatusEnum.STARTING.toString()
		)

		const commandHandler = this.container.get(CommandHandler)
		commandHandler.loadCommandHandlers()

		const database = this.container.get(Database)
		const dbInit = await database.initialize(true)
		if (dbInit) {
			const worldServerData = World.worlds[0].toWorldServerData()
			const worldServer = new WorldServer(worldServerData)
			this.container.register(WorldServer, worldServer)
			await worldServer.Start()
		}

		await logger.writeAsync(`Server started!`, ansiColorCodes.bgGreen)
	}
}

const main = new WorldMain()
main.Start()

process.on("SIGINT", async () => {
	const container = Container.getInstance()
	const worldTransition = container.get(WorldTransition)
	const worldServerManager = container.get(WorldServerManager)
	const database = container.get(Database)

	await worldTransition.handleServerStatusUpdate(
		World.worlds[0].toWorldServerData().Id,
		ServerStatusEnum.OFFLINE.toString()
	)
	await worldServerManager._realmList[0].Stop()
	await database.prisma.$disconnect()
	await worldTransition.disconnect()
	process.exit(0)
})



export default WorldMain