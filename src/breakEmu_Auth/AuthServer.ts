import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import { Socket, createServer } from "net"
import { AuthClient } from "./AuthClient"
import { AuthConfiguration } from "../breakEmu_Core/AuthConfiguration"
import ServerStatus from "./enum/ServerStatus"
import AuthServerStatus from "../breakEmu_AuthConsole/AuthServerStatus"

export class AuthServer {
	public logger: Logger = new Logger("AuthServer")

	private SERVER_STATE: number = ServerStatus.Offline

	private clients: AuthClient[] = []

	private static _instance: AuthServer

	private ip: string
	private port: number

	public constructor(ip: string, port: number) {
		this.ip = ip
		this.port = port
	}

	public get ServerState(): number {
		return this.SERVER_STATE
	}

	public static getInstance(): AuthServer {
		if (!AuthServer._instance) {
			AuthServer._instance = new AuthServer(
				AuthConfiguration.getInstance().authServerHost,
				AuthConfiguration.getInstance().authServerPort
			)
		}

		return AuthServer._instance
	}

	public delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	public async Start(): Promise<void> {
		const server = createServer(
			async (socket) => await this.handleConnection(socket)
		)

		return new Promise((resolve, reject) => {
			server.listen({ port: this.port, host: this.ip }, async () => {
				await this.logger.writeAsync(
					`Server listening on ${this.ip}:${this.port}`
				)
				this.SERVER_STATE = ServerStatus.Online

				resolve()
			})

			server.on("error", (err) => {
				this.logger.write(
					`Error starting server: ${err.message}`,
					ansiColorCodes.red
				)
				reject(err)
			})
		})
	}

	private async handleConnection(socket: Socket): Promise<void> {
		return await new Promise<void>(async (resolve, reject) => {
			const client = new AuthClient(socket)
			await this.AddClient(client) // Attendre l'ajout et l'initialisation du client
			// Configurer les gestionnaires d'événements après l'initialisation
			await client.setupEventHandlers()

			await client.initialize()

			resolve()
		})
	}

	public async AddClient(client: AuthClient): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			// Log de la nouvelle connexion
			this.clients.push(client)
			await this.logger.writeAsync(
				`New client connected: ${client.Socket.remoteAddress}:${client.Socket.remotePort}`,
				ansiColorCodes.magenta
			)
			await this.logger.writeAsync(
				`Total clients: ${
					this.clients.length
				} | Total clients connected: ${this.TotalConnectedClients()}`
			)

			resolve()
		})
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
