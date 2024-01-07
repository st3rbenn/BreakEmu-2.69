import { Server, Socket, createServer } from "net"
import WorldTransition from "../breakEmu_World/WorldTransition"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import WorldClient from "./WorldClient"
import WorldServerData from "./WorldServerData"
import ServerStatusEnum from "./enum/ServerStatusEnum"
class WorldServer {
	public logger: Logger = new Logger("WorldServer")
	public SERVER_STATE: number = ServerStatusEnum.OFFLINE

	public worldServerData: WorldServerData

  private static _instance: WorldServer

	public clients: Map<string, WorldClient> = new Map<string, WorldClient>()

	private _server: Server | undefined

	public constructor(worldServerData: WorldServerData) {
		this.worldServerData = worldServerData
	}

  public static getInstance(worldServerData?: WorldServerData): WorldServer {
    if (!WorldServer._instance) {
      WorldServer._instance = new WorldServer(worldServerData as WorldServerData)
    }

    return WorldServer._instance
  }

	public async Start(): Promise<void> {
		this.logger.write(`Starting server ${this.worldServerData.Name}`)
		this.SERVER_STATE = ServerStatusEnum.STARTING

		this._server = createServer((socket) => this.handleConnection(socket))
		this._server.listen(
			{ port: this.worldServerData.Port, host: this.worldServerData.Address },
			() => {
				this.SERVER_STATE = ServerStatusEnum.ONLINE
				this.logger.write(
					`Server listening on ${this.worldServerData.Address}:${this.worldServerData.Port}`
				)
			}
		)

		WorldTransition.getInstance().send(
			"ServerStatusUpdateMessage",
			JSON.stringify({
				serverId: this.worldServerData.Id,
				status: ServerStatusEnum.ONLINE.toString(),
			})
		)

		this._server.on("error", (err) => {
			this.logger.write(
				`Error starting server: ${err.message}`,
				ansiColorCodes.red
			)
		})
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
		const worldClient = new WorldClient(socket)
		this.AddClient(worldClient)
		worldClient.setupEventHandlers()
		worldClient.initialize()
	}

	public async AddClient(client: WorldClient): Promise<void> {
		this.clients.set(client.Socket.remoteAddress as string, client)
	}

	public RemoveClient(client: WorldClient): void {
		client.Socket.destroy()
		this.logger.write(
			`Client ${client.Socket.remoteAddress}:${client.Socket.remotePort} disconnected`,
			ansiColorCodes.red
		)
		this.clients.delete(client.Socket.remoteAddress as string)
	}

	public TotalConnectedClients(): number {
		return this.clients.size
	}
}

export default WorldServer
