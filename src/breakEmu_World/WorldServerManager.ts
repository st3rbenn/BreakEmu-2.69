import { ConsumeMessage } from "amqplib"
import { AuthClient } from "../breakEmu_Auth/AuthClient"
import TransitionManager from "../breakEmu_Auth/TransitionServer"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import {
	BinaryBigEndianReader,
	DofusMessage,
	DofusNetworkMessage,
	GameServerInformations,
	messages,
} from "../breakEmu_Server/IO"
import WorldServer from "./WorldServer"
import { WorldRegistrationRequestMessage } from "../breakEmu_Server/IO"
import WorldServerData from "./WorldServerData"
import WorldController from "../breakEmu_API/controller/world.controller"
import TransitionServer from "../breakEmu_Auth/TransitionServer"
class WorldServerManager {
	public logger: Logger = new Logger("WorldServerManager")

	private static _instance: WorldServerManager

	private ip: string
	private port: number

	public constructor(ip: string, port: number) {
		this.ip = ip
		this.port = port
	}

	public allowedIps: string[] = ["127.0.0.1"]

	public _realmList: WorldServer[] = []

	public static getInstance(): WorldServerManager {
		if (!WorldServerManager._instance) {
			WorldServerManager._instance = new WorldServerManager(
				ConfigurationManager.getInstance().worldServerHost,
				ConfigurationManager.getInstance().worldServerPort
			)
		}

		return WorldServerManager._instance
	}

	public async Start(): Promise<void> {
    this.logger.writeAsync(`Starting WorldServerManager...`, ansiColorCodes.dim)
		TransitionServer.getInstance().send("RequestForWorldListMessage", "")
    this.handleMessages()
	}

	public async handleMessages() {
		// Supposons que TransitionManager a une méthode pour écouter les messages
		TransitionManager.getInstance().receive(
			"worlds",
			(msg: ConsumeMessage | null) => {
				// Traiter le message ici
				if (msg) {
					// const message = this.deserialize(msg?.content)
					const message = JSON.parse(msg.content.toString())
					const worldServerData = new WorldServerData(
						message.content.id,
						message.content.address,
						message.content.port,
						message.content.name,
						message.content.capacity,
						message.content.requiredRole,
						message.content.isMonoAccount,
						message.content.isSelectable,
						message.content.requireSubscription
					)
					const worldServer = new WorldServer(worldServerData)
					worldServer.Start()

					this._realmList.push(worldServer)
				}
			}
		)

		TransitionManager.getInstance().receive(
			"needServerStatus",
			async (msg: ConsumeMessage | null) => {
				await TransitionManager.getInstance().send(
					"ServerStatusUpdateMessage",
					JSON.stringify({
						serverId: this._realmList[0].worldServerData.Id,
						status: this._realmList[0].SERVER_STATE.toString(),
					})
				)
			}
		)

		// La méthode reste en écoute pour de nouveaux messages
	}

	public deserialize(data: Buffer): DofusMessage {
		const reader = new BinaryBigEndianReader({
			maxBufferLength: data.length,
		}).writeBuffer(data)

		const {
			messageId,
			instanceId,
			payloadSize,
		} = DofusNetworkMessage.readHeader(reader)
		if (!(messageId in messages)) {
			this.logger.writeAsync(
				`Undefined message (id: ${messageId})`,
				ansiColorCodes.red
			)
		}

		const message = new messages[messageId]()
		message.deserialize(reader)

		return message
	}

	public gameServerInformationArray(
		client: AuthClient
	): GameServerInformations[] {
		return WorldController.getInstance()
			.worldList.filter((server) => client.canAccessWorld(server))
			.map((server) => this.gameServerInformation(client, server))
	}

	public gameServerInformation(
		client: AuthClient,
		server: WorldServer,
		status?: number
	): GameServerInformations {
		const charCount = 0

		const gameServerMessage = new GameServerInformations(
			server.worldServerData.IsMonoAccount,
			server.worldServerData.IsSelectable,
			server.worldServerData.Id,
			0,
			status || server.SERVER_STATE,
			1,
			charCount,
			5,
			new Date().getTime()
		)

		return gameServerMessage
	}
}

export default WorldServerManager
