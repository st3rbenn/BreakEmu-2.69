import Database from "./breakEmu_API/Database"
import TransitionServer from "./breakEmu_Auth/TransitionServer"
import { AuthConfiguration } from "./breakEmu_Core/AuthConfiguration"
import { ansiColorCodes } from "./breakEmu_Core/Colors"
import Logger from "./breakEmu_Core/Logger"
import RSAKeyHandler from "./breakEmu_Core/RSAKeyHandler"
import WorldServerManager from "./breakEmu_World/WorldServerManager"
import ServerStatusEnum from "./breakEmu_World/enum/ServerStatusEnum"

class Main {
	public logger: Logger = new Logger("Main")

	private transitionServer: TransitionServer = TransitionServer.getInstance()

	constructor() {
		this.Start()
	}

	async Start(): Promise<void> {
		await this.logger.onStartup()
		RSAKeyHandler.getInstance().initialize()
		await AuthConfiguration.getInstance().Load()
		await Database.getInstance().initialize()
		await this.transitionServer.connect()

		await WorldServerManager.getInstance().handleMessages()

		await this.logger.writeAsync(`Server started!`, ansiColorCodes.bgGreen)

		await TransitionServer.getInstance().send("RequestForWorldListMessage", "")
	}
}

process.on("SIGINT", async () => {
	// Appeler votre méthode ici
	const server = WorldServerManager.getInstance()._realmList[0]
	await server.Stop()

	// process.exit(2)
})

process.on("uncaughtException", async (err) => {
	console.error(err)
	const server = WorldServerManager.getInstance()._realmList[0]
	await server.Stop()
})

new Main()
