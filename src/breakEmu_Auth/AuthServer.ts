import { ConsumeMessage } from "amqplib"
import { Socket, createServer } from "net"
import WorldController from "../breakEmu_API/controller/world.controller"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import {
	BinaryBigEndianWriter,
	DofusMessage,
	DofusNetworkMessage,
	ServerStatusUpdateMessage,
	messages,
} from "../breakEmu_Server/IO"
import WorldServerManager from "../breakEmu_World/WorldServerManager"
import { AuthClient } from "./AuthClient"
import {
	default as TransitionManager,
	default as TransitionServer,
} from "./TransitionServer"
import ServerStatus from "./enum/ServerStatus"
import ConnectionQueue from "./ConnectionQueue"

export class AuthServer {
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
		// Log de la nouvelle connexion
		return new Promise(async (resolve) => {
			this.clients.push(client)
			await this.logger.writeAsync(
				`New client connected: ${client.Socket.remoteAddress}:${client.Socket.remotePort}`,
				ansiColorCodes.magenta
			)

			this.handleMessages()

			await this.logger.writeAsync(
				`Total clients: ${
					this.clients.filter((c) => c.Socket.writable).length
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

	public async handleMessages() {
		// Supposons que TransitionManager a une méthode pour écouter les messages
		TransitionManager.getInstance().receive(
			"ServerStatusUpdateMessage",
			async (msg: ConsumeMessage | null) => {
				// Traiter le message ici
				if (msg) {
					// const message = this.deserialize(msg?.content)
					const message = JSON.parse(msg.content.toString())
					await this.logger.writeAsync(`ServerStatusUpdateMessage`)
					const server = WorldController.getInstance().worldList.find(
						(s) => s.worldServerData.Id === message.serverId
					)
					if (!server) return

					server.SERVER_STATE = message.status

					for (const client of AuthServer.getInstance().GetClients()) {
						const gameServerMessage = WorldServerManager.getInstance().gameServerInformation(
							client,
							server,
							message.status
						)
						const serverStatusUpdateMessage = new ServerStatusUpdateMessage(
							gameServerMessage
						)

						await client.Send(client.serialize(serverStatusUpdateMessage))
					}
				}
			}
		)

		TransitionManager.getInstance().receive(
			"RequestForWorldListMessage",
			async (msg: ConsumeMessage | null) => {
				// Traiter le message ici
				if (msg) {
					console.log("RequestForWorldListMessage")
					const serverList = WorldController.getInstance().worldList

					let listOfWorlds: any[] = []

					for (const server of serverList) {
						listOfWorlds.push(server.worldServerData)
					}

					await TransitionManager.getInstance().send(
						"worlds",
						JSON.stringify({
							messageId: 2590,
							content: listOfWorlds[0],
						})
					)
				}
			}
		)

		// La méthode reste en écoute pour de nouveaux messages
	}
}
