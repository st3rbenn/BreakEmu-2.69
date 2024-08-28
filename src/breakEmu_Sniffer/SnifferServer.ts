import { createServer } from "net"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import ConnectionQueue from "@breakEmu_Auth/ConnectionQueue"
import ServerClient from "@breakEmu_Server/ServerClient"
import SnifferClient from "./SnifferClient"

class SnifferServer {
	public logger: Logger = new Logger("SnifferServer")

	// private SERVER_STATE: number = ServerStatus.Offline
	public MAX_DOFUS_MESSAGE_HEADER_SIZE: number = 10

	private clients: SnifferClient[] = []

	private static _instance: SnifferServer

	private ip: string
	private port: number

	public constructor(ip: string, port: number) {
		this.ip = ip
		this.port = port
	}

	public static getInstance(): SnifferServer {
		if (!SnifferServer._instance) {
			SnifferServer._instance = new SnifferServer(
				ConfigurationManager.getInstance().snifferServerHost,
				ConfigurationManager.getInstance().snifferServerPort
			)
		}

		return SnifferServer._instance
	}

	// public get ServerState(): number {
	// 	return this.SERVER_STATE
	// }

	public async Start(): Promise<void> {
		const server = createServer(
			async (socket) => await ConnectionQueue.getInstance().enqueue(socket)
		)

		server.listen({ port: this.port, host: this.ip }, async () => {
			await this.logger.writeAsync(
				`Server listening on ${this.ip}:${this.port}`,
				ansiColorCodes.bgGreen
			)
		})

		server.on("data", async (data) => {
			await this.logger.writeAsync(
				`Data received: ${data.toString()}`,
				ansiColorCodes.green
			)
		})

		server.on("error", async (err) => {
			await this.logger.writeAsync(
				`Error starting server: ${err.message}`,
				ansiColorCodes.red
			)
		})
	}

	public async AddClient(client: SnifferClient): Promise<void> {
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

	public RemoveClient(client: SnifferClient): void {
		client.Socket.destroy()
		this.clients.splice(this.clients.indexOf(client), 1)
	}

	public TotalConnectedClients(): number {
		return this.clients.filter((c) => c.Socket.writable).length
	}

	public GetClients(): SnifferClient[] {
		return this.clients
	}
}

export default SnifferServer
