import { Server, Socket, createServer } from "net"
import CharacterController from "../breakEmu_API/controller/character.controller"
import Character from "../breakEmu_API/model/character.model"
import GameMap from "../breakEmu_API/model/map.model"
import World from "../breakEmu_API/model/world.model"
import BullManager from "../breakEmu_Core/bull/TaskManager"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import WorldTransition from "../breakEmu_World/WorldTransition"
import WorldClient from "./WorldClient"
import WorldServerData from "./WorldServerData"
import ServerStatusEnum from "./enum/ServerStatusEnum"
import SaveTask from "../breakEmu_Core/bull/tasks/SaveTask"
import TaskManager from "../breakEmu_Core/bull/TaskManager"

class WorldServer {
	public logger: Logger = new Logger("WorldServer")
	public SERVER_STATE: number = ServerStatusEnum.OFFLINE

	public worldServerData: WorldServerData

	private static _instance: WorldServer

	public clients: Map<number, WorldClient> = new Map()

	private _server: Server | undefined

	constructor(worldServerData: WorldServerData) {
		this.worldServerData = worldServerData
	}

	public static getInstance(worldServerData?: WorldServerData): WorldServer {
		if (!WorldServer._instance) {
			WorldServer._instance = new WorldServer(
				worldServerData as WorldServerData
			)
		}

		return WorldServer._instance
	}

	public async Start(): Promise<void> {
		const server = createServer(
			async (socket) => await this.handleConnection(socket)
		)
		server.listen({
			port: this.worldServerData.Port,
			host: this.worldServerData.Address,
		})

		this._server = server
		this.SERVER_STATE = ServerStatusEnum.ONLINE

		this._server.on("error", (err) => {
			this.logger.write(
				`Error starting server: ${err.message}`,
				ansiColorCodes.red
			)
		})

		await WorldTransition.getInstance().handleServerStatusUpdate(
			this.worldServerData.Id,
			this.SERVER_STATE.toString()
		)

		TaskManager.getInstance().saveTaskHandler().setCron("*/5 * * * *").run()

		TaskManager.getInstance().elementBonusHandler()
	}

	private async saveAllCharacters(): Promise<void> {
		await this.logger.writeAsync(`Saving all characters...`)
		for (const client of this.clients.values()) {
			if (client?.selectedCharacter) {
				await this.logger.writeAsync(
					`Saving character ${client.selectedCharacter.name}`
				)
				await CharacterController.getInstance().updateCharacter(
					client.selectedCharacter
				)
			}
		}
	}

	public async save(): Promise<void> {
		await this.saveAllCharacters()
	}

	public async Stop(): Promise<void> {
		this.logger.write(`Stoping server ${this.worldServerData.Name}`)
		this.SERVER_STATE = ServerStatusEnum.STOPING
		this._server?.close(() => {
			this.SERVER_STATE = ServerStatusEnum.OFFLINE
		})
		WorldTransition.getInstance().handleServerStatusUpdate(
			World.worlds[0].toWorldServerData().Id,
			ServerStatusEnum.OFFLINE.toString()
		)
	}

	private async handleConnection(socket: Socket): Promise<void> {
		await this.logger.writeAsync(`New connection from ${socket.remoteAddress}`)
		const worldClient = await WorldTransition.getInstance().handleAccountTransition(
			socket
		)

		if (!worldClient) {
			await this.logger.writeAsync(`Account not found`, ansiColorCodes.red)
			return
		}
		this.AddClient(worldClient)
	}

	public async AddClient(client: WorldClient): Promise<void> {
		await client.initialize()
		client.setupEventHandlers()

		this.clients.set(client?.account?.id as number, client)
		await this.logger.writeAsync(
			`Client ${client.Socket.remoteAddress}:${client.Socket.remotePort} connected`
		)
	}

	public async removeClient(client: WorldClient): Promise<void> {
		await this.logger.writeAsync(
			`Client ${client.account?.pseudo} disconnected`,
			ansiColorCodes.red
		)
		await client.selectedCharacter?.disconnect()
		this.clients.delete(client?.account?.id as number)
	}

	public TotalConnectedClients(): number {
		this.logger.write(
			`Total connected clients: ${this.TotalConnectedClients()}`
		)
		return this.clients.size
	}
}

export default WorldServer
