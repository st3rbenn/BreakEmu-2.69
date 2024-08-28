import Database from "./breakEmu_API/Database"
import WorldController from "./breakEmu_API/controller/world.controller"
import AuthServer from "./breakEmu_Auth/AuthServer"
import AuthTransition from "./breakEmu_Auth/AuthTransition"
import Logger from "./breakEmu_Core/Logger"
import ConfigurationManager from "./breakEmu_Core/configuration/ConfigurationManager"
import SnifferServer from "./breakEmu_Sniffer/SnifferServer"

class Main {
	public logger: Logger = new Logger("Main")

	async Start(): Promise<void> {
		try {
			await this.logger.onStartup()
			await ConfigurationManager.getInstance().Load()
			await SnifferServer.getInstance().Start()
		} catch (error) {
			await this.logger.writeAsync(`Error starting server: ${error}`, "red")
		}
	}
}

new Main().Start()
