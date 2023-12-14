import { AuthServer } from "./breakEmu_Auth/AuthServer"
import Logger from "./breakEmu_Core/Logger"
import { AuthConfiguration } from "./breakEmu_Core/AuthConfiguration"
import RSAKeyHandler from "./breakEmu_Core/RSAKeyHandler"
import Database from "./breakEmu_API/Database"
import WorldServerManager from "./breakEmu_World/WorldServerManager"
class Main {
	public logger: Logger = new Logger("Main")

	private authConfiguration: AuthConfiguration

	constructor() {
		this.Start()
		this.authConfiguration = AuthConfiguration.getInstance()
	}

	async Start(): Promise<void> {
		await this.logger.onStartup()
		RSAKeyHandler.getInstance().initialize()
		await this.authConfiguration.Load()
		await Database.getInstance().initialize()
		await AuthServer.getInstance().Start()

    await WorldServerManager.getInstance().initialize()
	}
}

new Main()
