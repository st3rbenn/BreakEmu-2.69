import Database from "./breakEmu_API/Database"
import WorldController from "./breakEmu_API/controller/world.controller"
import AuthServer from "./breakEmu_Auth/AuthServer"
import AuthTransition from "./breakEmu_Auth/AuthTransition"
import Logger from "./breakEmu_Core/Logger"
import ConfigurationManager from "./breakEmu_Core/configuration/ConfigurationManager"

class Main {
	public logger: Logger = new Logger("Main")
	private authTransition: AuthTransition = AuthTransition.getInstance()

	async Start(): Promise<void> {
		try {
			await this.logger.onStartup()
			await ConfigurationManager.getInstance().Load()
			await Database.getInstance().initialize()
			await this.authTransition.connect()
			await WorldController.getInstance().getRealmList()
			await AuthServer.getInstance().Start()

			await this.authTransition.handleMessagesForAuth()
		} catch (error) {
			await this.logger.writeAsync(`Error starting server: ${error}`, "red")
		}
	}
}

new Main().Start().then(r => {
	console.log("And the magic begins...")
})
