import { Server, Socket, createServer } from "net"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import WorldServerData from "./WorldServerData"
import ServerStatusEnum from "./enum/ServerStatusEnum"
import TransitionServer from "../breakEmu_Auth/TransitionServer"
import WorldClient from "./WorldClient"
class WorldServer {
	public logger: Logger = new Logger("WorldServer")
	public SERVER_STATE: number = ServerStatusEnum.OFFLINE

	public worldServerData: WorldServerData

	public clients: WorldClient[] = []

	private _server: Server | undefined

	public constructor(worldServerData: WorldServerData) {
		this.worldServerData = worldServerData
	}

	public async Start(): Promise<void> {
		this.logger.write(`Starting server ${this.worldServerData.Name}`)
		this.SERVER_STATE = ServerStatusEnum.STARTING
		await TransitionServer.getInstance().send(
			"ServerStatusUpdateMessage",
			JSON.stringify({
				serverId: this.worldServerData.Id,
				status: this.SERVER_STATE.toString(),
			})
		)

		this._server = createServer((socket) => this.handleConnection(socket))
		this._server.listen(
			{ port: this.worldServerData.Port, host: this.worldServerData.Address },
			async () => {
				await this.logger.writeAsync(
					`Server listening on ${this.worldServerData.Address}:${this.worldServerData.Port}`
				)
			}
		)

		this.SERVER_STATE = ServerStatusEnum.ONLINE
		await TransitionServer.getInstance().send(
			"ServerStatusUpdateMessage",
			JSON.stringify({
				serverId: this.worldServerData.Id,
				status: this.SERVER_STATE.toString(),
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
		await TransitionServer.getInstance().send(
			"ServerStatusUpdateMessage",
			JSON.stringify({
				serverId: this.worldServerData.Id,
				status: this.SERVER_STATE.toString(),
			})
		)
		this.SERVER_STATE = ServerStatusEnum.OFFLINE

		this._server?.close(() => {
			TransitionServer.getInstance().send(
				"ServerStatusUpdateMessage",
				JSON.stringify({
					serverId: this.worldServerData.Id,
					status: this.SERVER_STATE.toString(),
				})
			)
		})
	}

	private async handleConnection(socket: Socket): Promise<void> {
		await this.logger.writeAsync(`New connection from ${socket.remoteAddress}`)
		const worldClient = new WorldClient(socket, this)
		this.AddClient(worldClient)
		await worldClient.setupEventHandlers()

		await worldClient.initialize()
	}

	public async AddClient(client: WorldClient): Promise<void> {
		// Log de la nouvelle connexion
		return new Promise(async (resolve) => {
			this.clients.push(client)
			await this.logger.writeAsync(
				`New client connected: ${client.Socket.remoteAddress}:${client.Socket.remotePort}`,
				ansiColorCodes.magenta
			)

			await this.logger.writeAsync(
				`Total clients: ${
					this.clients.filter((c) => c.Socket.writable).length
				} | Total clients connected: ${this.TotalConnectedClients()}`
			)

			resolve()
		})
	}

	public RemoveClient(client: WorldClient): void {
		client.Socket.destroy()
		this.logger.write(
			`Client ${client.Socket.remoteAddress}:${client.Socket.remotePort} disconnected`,
			ansiColorCodes.red
		)
		this.clients.splice(this.clients.indexOf(client), 1)
	}

	public TotalConnectedClients(): number {
		return this.clients.filter((c) => c.Socket.writable).length
	}
}

export default WorldServer
