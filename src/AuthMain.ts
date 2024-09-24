import Container from "@breakEmu_Core/container/Container"
import { registerServices } from "@breakEmu_Core/container/service/ServiceRegistry"
import Logger from "@breakEmu_Core/Logger"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import Database from "@breakEmu_API/Database"
import AuthTransition from "@breakEmu_Auth/AuthTransition"
import WorldController from "@breakEmu_API/controller/world.controller"
import AuthServer from "@breakEmu_Auth/AuthServer"

class Main {
	private container: Container

	constructor() {
		this.container = Container.getInstance()
		this.container.register(Logger, new Logger("Main"))
		registerServices(this.container)
	}

	async Start(): Promise<void> {
		try {
			const logger = this.container.get(Logger)
			await logger.onStartup()

			const configManager = this.container.get(ConfigurationManager)
			await configManager.Load()

			const database = this.container.get(Database)
			await database.initialize()

			const authTransition = this.container.get(AuthTransition)
			await authTransition.connect()

			const worldController = this.container.get(WorldController)
			await worldController.getRealmList()

			this.container.register(
				AuthServer,
				new AuthServer(
					container.get(ConfigurationManager).authServerHost,
					container.get(ConfigurationManager).authServerPort
				)
			)
			await this.container.get(AuthServer).Start()
		} catch (error) {
			const logger = this.container.get(Logger)
			await logger.writeAsync(`Error starting server: ${error}`, "red")
		}
	}
}

const container = Container.getInstance()
const main = new Main()
main.Start().then(async () => {
	const authTransition = container.get(AuthTransition)
	await authTransition.startListeningForServerStatusUpdates()
})
