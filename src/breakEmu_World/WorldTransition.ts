import { Connection, ConsumeMessage } from "amqplib"
import UserController from "../breakEmu_API/controller/user.controller"
import Logger from "../breakEmu_Core/Logger"
import TransitionServer from "../breakEmu_Server/TransitionServer"
import WorldClient from "./WorldClient"
import WorldServerManager from "./WorldServerManager"

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

	public async handleAccountTransition(client: WorldClient) {
		await this.receive(
			"accountTransfer",
			async (msg: ConsumeMessage | null) => {
				if (msg) {
					const message = JSON.parse(msg.content.toString())

					const acc = await new UserController().getAccountByNickname(
						message.pseudo
					)

					if (client) {
						client.account = acc
					}
				}
			}
		)
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
