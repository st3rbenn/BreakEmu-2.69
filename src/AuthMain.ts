import Database from "./breakEmu_API/Database"
import WorldController from "./breakEmu_API/controller/world.controller"
import AuthServer from "./breakEmu_Auth/AuthServer"
import AuthTransition from "./breakEmu_Auth/AuthTransition"
import Logger from "./breakEmu_Core/Logger"
import ConfigurationManager from "./breakEmu_Core/configuration/ConfigurationManager"

class Main {
	public logger: Logger = new Logger("Main")
	public authTransition: AuthTransition = AuthTransition.getInstance()

	async Start(): Promise<void> {
		try {
			await this.logger.onStartup()
			await ConfigurationManager.getInstance().Load()
			await Database.getInstance().initialize()
			await this.authTransition.connect()
			await WorldController.getInstance().getRealmList()
			await AuthServer.getInstance().Start()
		} catch (error) {
			await this.logger.writeAsync(`Error starting server: ${error}`, "red")
		}
	}
}

new Main().Start().then(async () => {
	await AuthTransition.getInstance().startListeningForServerStatusUpdates()
})

// setInterval(() => {
//   const memoryUsage = process.memoryUsage();

//   console.log(`Memory usage: ${memoryUsage.rss / 1024 / 1024} MB`);
// }, 1000);
