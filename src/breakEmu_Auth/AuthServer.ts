import { createServer } from "net"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import AuthClient from "./AuthClient"
import ConnectionQueue from "./ConnectionQueue"
import ServerStatus from "./enum/ServerStatus"

class AuthServer {
	public logger: Logger = new Logger("AuthServer")

	private SERVER_STATE: number = ServerStatus.Offline
	public MAX_DOFUS_MESSAGE_HEADER_SIZE: number = 10

	private clients: AuthClient[] = []

	private static _instance: AuthServer

	private ip: string
	private port: number

	public constructor(ip: string, port: number) {
		this.ip = ip
		this.port = port
	}

	public static getInstance(): AuthServer {
		if (!AuthServer._instance) {
			AuthServer._instance = new AuthServer(
				ConfigurationManager.getInstance().authServerHost,
				ConfigurationManager.getInstance().authServerPort
			)
		}

		return AuthServer._instance
	}

	public get ServerState(): number {
		return this.SERVER_STATE
	}

	public async Start(): Promise<void> {
		const server = createServer(
			async (socket) => await ConnectionQueue.getInstance().enqueue(socket)
		)

		server.listen({ port: this.port, host: this.ip }, async () => {
			await this.logger.writeAsync(
				`Server listening on ${this.ip}:${this.port}`,
				ansiColorCodes.bgGreen
			)
			this.SERVER_STATE = ServerStatus.Online
		})

		server.on("error", async (err) => {
			await this.logger.writeAsync(
				`Error starting server: ${err.message}`,
				ansiColorCodes.red
			)
		})
	}

	public async AddClient(client: AuthClient): Promise<void> {
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
	}

	public RemoveClient(client: AuthClient): void {
		client.Socket.destroy()
		this.clients.splice(this.clients.indexOf(client), 1)
	}

	public TotalConnectedClients(): number {
		return this.clients.filter((c) => c.Socket.writable).length
	}

	public GetClients(): AuthClient[] {
		return this.clients
	}
}

export default AuthServer