import Database from "./breakEmu_API/Database"
import TransitionServer from "./breakEmu_Auth/TransitionServer"
import ConfigurationManager from "./breakEmu_Core/configuration/ConfigurationManager"
import { ansiColorCodes } from "./breakEmu_Core/Colors"
import Logger from "./breakEmu_Core/Logger"
import RSAKeyHandler from "./breakEmu_Core/RSAKeyHandler"
import WorldServerManager from "./breakEmu_World/WorldServerManager"
import ServerStatusEnum from "./breakEmu_World/enum/ServerStatusEnum"

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

		await WorldServerManager.getInstance().Start()

		await this.logger.writeAsync(`Server started!`, ansiColorCodes.bgGreen)
	}
}

new Main()
