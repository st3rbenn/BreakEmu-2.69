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
import Container from "@breakEmu_Core/container/Container"

class WorldServer {
	public logger: Logger = new Logger("WorldServer")
	public SERVER_STATE: number = ServerStatusEnum.OFFLINE

	public worldServerData: WorldServerData

  private container: Container = Container.getInstance()

	public clients: Map<number, WorldClient> = new Map()

	private _server: Server | undefined

	constructor(worldServerData: WorldServerData) {
		this.worldServerData = worldServerData
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

		await this.container.get(WorldTransition).handleServerStatusUpdate(
			this.worldServerData.Id,
			this.SERVER_STATE.toString()
		)
    this.container.register(WorldServer, this)

		this.container.get(TaskManager).saveTaskHandler().setCron("*/5 * * * *").run()
		this.container.get(TaskManager).elementBonusHandler()
	}

	private async saveAllCharacters(): Promise<void> {
		this.logger.write(`Saving all characters...`)
		for (const client of this.clients.values()) {
			if (client?.selectedCharacter) {
				this.logger.write(`Saving character ${client.selectedCharacter.name}`)
				await this.container.get(CharacterController).updateCharacter(
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

		await this.container.get(WorldTransition).handleServerStatusUpdate(
			this.worldServerData.Id,
			ServerStatusEnum.OFFLINE.toString()
		)

		// Stop scheduled tasks
		this.container.get(TaskManager).stopAllTasks()
	}

	private async handleConnection(socket: Socket): Promise<void> {
		this.logger.write(`New connection from ${socket.remoteAddress}`)
		const worldClient = await this.container.get(WorldTransition).handleAccountTransition(
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
