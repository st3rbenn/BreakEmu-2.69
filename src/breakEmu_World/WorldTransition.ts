import { Connection } from "amqplib"
import { Socket } from "net"
import UserController from "../breakEmu_API/controller/user.controller"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import TransitionServer from "../breakEmu_Server/TransitionServer"
import WorldClient from "./WorldClient"
import WorldServer from "./WorldServer"

class WorldTransition extends TransitionServer {
	logger: Logger = new Logger("WorldTransition")
	connection: Connection | null = null
	private static _instance: WorldTransition

	public static getInstance(): WorldTransition {
		if (!WorldTransition._instance) {
			WorldTransition._instance = new WorldTransition(
				process.env.REDIS_URI as string
			)
		}

		return WorldTransition._instance
	}

	constructor(uri: string) {
		super(uri)
	}

	public async handleAccountTransition(
		socket: Socket
	): Promise<WorldClient | null> {
		try {
			const userController = new UserController()
			let worldClient: WorldClient | null = null

			const msg = await this.receive("accountTransfer")

			const message = JSON.parse(msg as string)
			this.logger.write(
				`Received account transfer request for ${message.pseudo}`,
				ansiColorCodes.dim
			)

			return new WorldClient(socket, message.pseudo)
		} catch (error) {
			await this.logger.writeAsync(
				`Error while handling account transition: ${(error as any).message}`,
				ansiColorCodes.red
			)
			return Promise.resolve(null)
		}
	}

	async handleServerStatusUpdate(serverId: number, status: string) {
		await this.publish(
			"ServerStatusUpdateChannel",
			JSON.stringify({
				serverId: serverId,
				status: status,
			})
		)
	}
}

export default WorldTransition
