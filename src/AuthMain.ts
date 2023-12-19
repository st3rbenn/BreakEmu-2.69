import Database from "./breakEmu_API/Database"
import WorldController from "./breakEmu_API/controller/world.controller"
import { AuthServer } from "./breakEmu_Auth/AuthServer"
import TransitionServer from "./breakEmu_Auth/TransitionServer"
import { AuthConfiguration } from "./breakEmu_Core/AuthConfiguration"
import Logger from "./breakEmu_Core/Logger"
import RSAKeyHandler from "./breakEmu_Core/RSAKeyHandler"

class Main {
	public logger: Logger = new Logger("Main")

	constructor() {
		this.Start()
	}

	async Start(): Promise<void> {
		await this.logger.onStartup()
		RSAKeyHandler.getInstance().initialize()
		await AuthConfiguration.getInstance().Load()
		await Database.getInstance().initialize()
		await TransitionServer.getInstance().connect()
    await WorldController.getInstance().getRealmList()
		// await WorldServerManager.getInstance().initialize()
		await AuthServer.getInstance().Start()

    await AuthServer.getInstance().handleMessages()
	}
}

new Main()
