import { Server, Socket, createServer } from "net"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import WorldServerData from "./WorldServerData"
import ServerStatusEnum from "./enum/ServerStatusEnum"
import TransitionServer from "../breakEmu_Auth/TransitionServer"
class WorldServer {
	public logger: Logger = new Logger("WorldServer")

	public SERVER_STATE: number = ServerStatusEnum.OFFLINE

	public worldServerData: WorldServerData

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

		this._server?.close(async () => {
			this.SERVER_STATE = ServerStatusEnum.OFFLINE
			await TransitionServer.getInstance().send(
				"ServerStatusUpdateMessage",
				JSON.stringify({
					serverId: this.worldServerData.Id,
					status: ServerStatusEnum.OFFLINE.toString(),
				})
			)
		})
	}

	private async handleConnection(socket: Socket): Promise<void> {
		await this.logger.writeAsync(`New connection from ${socket.remoteAddress}`)
	}
}

export default WorldServer
