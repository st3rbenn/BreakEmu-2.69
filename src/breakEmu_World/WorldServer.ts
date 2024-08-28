import { Server, Socket, createServer } from "net"
import CharacterController from "@breakEmu_API/controller/character.controller"
import World from "@breakEmu_API/model/world.model"
import TaskManager from "@breakEmu_Core/bull/TaskManager"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import WorldTransition from "@breakEmu_World/WorldTransition"
import ServerStatusEnum from "./enum/ServerStatusEnum"
import WorldClient from "./WorldClient"
import WorldServerData from "./WorldServerData"

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

		server.listen(
			{ port: this.worldServerData.Port, host: this.worldServerData.Address },
			() => {
				this.logger.write(
					`Server listening on ${this.worldServerData.Address}:${this.worldServerData.Port}`
				)
			}
		)

		this._server = server
		this.SERVER_STATE = ServerStatusEnum.ONLINE

		this._server.on("error", (err) => {
			this.logger.write(
				`Error starting server: ${err.stack}`,
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
		this.logger.write(`Saving all characters...`)
		for (const client of this.clients.values()) {
			if (client?.selectedCharacter) {
				this.logger.write(`Saving character ${client.selectedCharacter.name}`)
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
		this.logger.write(`Stopping server ${this.worldServerData.Name}`)
		this.SERVER_STATE = ServerStatusEnum.STOPING
		this._server?.close(() => {
			this.SERVER_STATE = ServerStatusEnum.OFFLINE
		})

		await WorldTransition.getInstance().handleServerStatusUpdate(
			this.worldServerData.Id,
			ServerStatusEnum.OFFLINE.toString()
		)

		// Stop scheduled tasks
		TaskManager.getInstance().stopAllTasks()
	}

	private async handleConnection(socket: Socket): Promise<void> {
		this.logger.write(`New connection from ${socket.remoteAddress}`)
		const worldClient = await WorldTransition.getInstance().handleAccountTransition(
			socket
		)

		if (!worldClient) {
			this.logger.write(`Account not found`, ansiColorCodes.red)
			socket.end()
			return
		}
		this.AddClient(worldClient)
	}

	public async AddClient(client: WorldClient): Promise<void> {
		await client.initialize()
		client.setupEventHandlers()

		this.clients.set(client.account.id as number, client)
		this.logger.write(
			`Client ${client.Socket.remoteAddress}:${client.Socket.remotePort} connected`
		)
	}

	public async removeClient(client: WorldClient): Promise<void> {
		try {
      if(client.selectedCharacter) {
        client.selectedCharacter.disconnect()
      }
			this.logger.write(
				`Client ${client.account?.pseudo} disconnected`,
				ansiColorCodes.red
			)
			this.clients.delete(client.account.id as number)
		} catch (error) {
			this.logger.write(
				`Error while removing client: ${error}`,
				ansiColorCodes.red
			)
		}
	}

	public TotalConnectedClients(): void {
		this.logger.write(`Total connected clients: ${this.clients.size}`)
	}
}

export default WorldServer
