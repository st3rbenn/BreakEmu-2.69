import { Connection, ConsumeMessage } from "amqplib"
import UserController from "../breakEmu_API/controller/user.controller"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import TransitionServer from "../breakEmu_Server/TransitionServer"
import WorldClient from "./WorldClient"
import WorldServerManager from "./WorldServerManager"
import Account from "../breakEmu_API/model/account.model"
import { Socket } from "net"

class WorldTransition extends TransitionServer {
	logger: Logger = new Logger("WorldTransition")
	connection: Connection | null = null
	private static _instance: WorldTransition

	public static getInstance(): WorldTransition {
		if (!WorldTransition._instance) {
			WorldTransition._instance = new WorldTransition(
				process.env.RABBITMQ_URI as string
			)
		}

		return WorldTransition._instance
	}

	constructor(uri: string) {
		super(uri)
	}

	public async handleMessagesForWorld() {
		// this.send("RequestForWorldListMessage", "")

		// await this.receive("worlds", (msg: ConsumeMessage | null) => {
		// 	// Traiter le message ici
		// 	if (msg) {
		// 		this.handleRequestForlWorldList(msg)
		// 	}
		// })

		await this.receive("needServerStatus", async (msg: ConsumeMessage | null) =>
			WorldTransition.handleServerStatusUpdate()
		)

		// La méthode reste en écoute pour de nouveaux messages
	}

	public async handleAccountTransition(socket: Socket): Promise<WorldClient | null> {
		const userController = new UserController()

		// Créer une nouvelle Promise pour gérer le flux asynchrone
		return new Promise<WorldClient | null>(async (resolve, reject) => {
			await this.receive(
				"accountTransfer",
				async (msg: ConsumeMessage | null) => {
					if (msg) {
						const message = JSON.parse(msg.content.toString())
						this.logger.write(
							`Received account transfer request for ${message.pseudo}`,
							ansiColorCodes.dim
						)

						const account = await userController.getAccountByNickname(
							message.pseudo
						)

						if (!account) {
							await this.logger.writeAsync(
								`Account ${message.pseudo} not found`,
								ansiColorCodes.red
							)
							resolve(null) // Résoudre la promesse avec null si le compte n'est pas trouvé
							return
						}
						// console.log("ACCOUNT: ", account)

						const worldClient = new WorldClient(socket, account)
						resolve(worldClient) // Résoudre la promesse avec le compte trouvé
					} else {
						resolve(null) // Résoudre la promesse avec null si aucun message n'est reçu
					}
				}
			)
		})
	}

	// private async handleRequestForlWorldList(msg: ConsumeMessage) {
	// 	const message = JSON.parse(msg.content.toString())
	// 	const worldServerData = new WorldServerData(
	// 		message.content.id,
	// 		message.content.address,
	// 		message.content.port,
	// 		message.content.name,
	// 		message.content.capacity,
	// 		message.content.requiredRole,
	// 		message.content.isMonoAccount,
	// 		message.content.isSelectable,
	// 		message.content.requireSubscription
	// 	)
	// 	const worldServer = new WorldServer(worldServerData)
	// 	WorldTransition.getInstance().send(
	// 		"ServerStatusUpdateMessage",
	// 		JSON.stringify({
	// 			serverId: message.content.id,
	// 			status: ServerStatusEnum.STARTING.toString(),
	// 		})
	// 	)
	// 	await worldServer.Start()

	// 	WorldServerManager.getInstance()._realmList.push(worldServer)
	// }

	private static async handleServerStatusUpdate() {
		await WorldTransition.getInstance().send(
			"ServerStatusUpdateMessage",
			JSON.stringify({
				serverId: WorldServerManager.getInstance()._realmList[0]
					?.worldServerData.Id,
				status: WorldServerManager.getInstance()._realmList[0]?.SERVER_STATE.toString(),
			})
		)
	}
}

export default WorldTransition
