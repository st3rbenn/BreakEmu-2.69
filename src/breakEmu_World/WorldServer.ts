import { Server, Socket, createServer } from "net"
import CharacterController from "../breakEmu_API/controller/character.controller"
import BullManager from "../breakEmu_Core/BullManager"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import WorldTransition from "../breakEmu_World/WorldTransition"
import WorldClient from "./WorldClient"
import WorldServerData from "./WorldServerData"
import ServerStatusEnum from "./enum/ServerStatusEnum"

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
		this.logger.write(`Starting server ${this.worldServerData.Name}`)

		const server = createServer(
			async (socket) => await this.handleConnection(socket)
		)
		server.listen(
			{ port: this.worldServerData.Port, host: this.worldServerData.Address },
			() => {
				this.SERVER_STATE = ServerStatusEnum.ONLINE
				WorldTransition.getInstance().handleServerStatusUpdate(this)
				this.logger.write(
					`Server listening on ${this.worldServerData.Address}:${this.worldServerData.Port}`
				)
			}
		)

		this._server = server

		this._server.on("error", (err) => {
			this.logger.write(
				`Error starting server: ${err.message}`,
				ansiColorCodes.red
			)
		})

		await BullManager.getInstance().Start()
	}

	private async saveAllCharacters(): Promise<void> {
    this.logger.write(`Saving all characters...`)
		for (const client of this.clients.values()) {
			if (client?.selectedCharacter) {
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
		await WorldTransition.getInstance().send(
			"ServerStatusUpdateMessage",
			JSON.stringify({
				serverId: this.worldServerData.Id,
				status: this.SERVER_STATE.toString(),
			})
		)
		this._server?.close(() => {
			this.SERVER_STATE = ServerStatusEnum.OFFLINE
		})
		await WorldTransition.getInstance().send(
			"ServerStatusUpdateMessage",
			JSON.stringify({
				serverId: this.worldServerData.Id,
				status: this.SERVER_STATE.toString(),
			})
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
		client.setupEventHandlers()
		await client.initialize()

		this.clients.set(client?.account?.id as number, client)
		this.logger.write(
			`Client ${client.Socket.remoteAddress}:${client.Socket.remotePort} connected`
		)
	}

	public RemoveClient(client: WorldClient): void {
		this.logger.write(
			`Client ${client.account?.pseudo} disconnected`,
			ansiColorCodes.red
		)

		this.clients.delete(client?.account?.id as number)

		this.logger.write(
			`Total connected clients: ${this.TotalConnectedClients()}`
		)
	}

	public TotalConnectedClients(): number {
		return this.clients.size
	}
}

export default WorldServer
