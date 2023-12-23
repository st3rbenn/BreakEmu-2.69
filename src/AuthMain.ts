import Database from "./breakEmu_API/Database"
import WorldController from "./breakEmu_API/controller/world.controller"
import { AuthServer } from "./breakEmu_Auth/AuthServer"
import TransitionServer from "./breakEmu_Auth/TransitionServer"
import Logger from "./breakEmu_Core/Logger"
import ConfigurationManager from "./breakEmu_Core/configuration/ConfigurationManager"

class Main {
	public logger: Logger = new Logger("Main")

	constructor() {
		this.Start()
	}

	async Start(): Promise<void> {
		try {
			await this.logger.onStartup()
			await ConfigurationManager.getInstance().Load()
			await Database.getInstance().initialize()
			await TransitionServer.getInstance().connect()
			await WorldController.getInstance().getRealmList()
			await AuthServer.getInstance().Start()

			await TransitionServer.getInstance().handleMessagesForAuth()

			// await this.logger.writeAsync(`start server stress test socket in 5s`)
			// wait 5s
			// await new Promise((resolve) => setTimeout(resolve, 5000))
			// new Playground()
		} catch (error) {
			await this.logger.writeAsync(`Error starting server: ${error}`, "red")
		}
	}
}

new Main()
