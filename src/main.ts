import { AuthServer } from "./breakEmu_Auth/AuthServer"
import Logger from "./breakEmu_Core/Logger"
import { AuthConfiguration } from "./breakEmu_Core/AuthConfiguration"
import RSAKeyHandler from "./breakEmu_Core/RSAKeyHandler"

class Main {
	public logger: Logger = new Logger()

	private authConfiguration: AuthConfiguration

	constructor() {
		this.Start()
		this.authConfiguration = AuthConfiguration.getInstance()
	}

	async Start(): Promise<void> {
		await this.logger.onStartup()
		RSAKeyHandler.getInstance().initialize()
		await this.authConfiguration.Load()

		await AuthServer.getInstance().Start()
	}
}

new Main()
