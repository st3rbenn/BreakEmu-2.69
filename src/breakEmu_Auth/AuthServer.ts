import { Socket, createServer } from "net"
import { AuthConfiguration } from "../breakEmu_Core/AuthConfiguration"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import { AuthClient } from "./AuthClient"
import ServerStatus from "./enum/ServerStatus"
import {
	BinaryBigEndianWriter,
	DofusMessage,
	DofusNetworkMessage,
	GameServerInformations,
	ServerStatusUpdateMessage,
	messages,
} from "../breakEmu_Server/IO"
import TransitionManager from "./TransitionServer"
import { ConsumeMessage } from "amqplib"
import WorldController from "../breakEmu_API/controller/world.controller"
import WorldServerManager from "../breakEmu_World/WorldServerManager"
import TransitionServer from "./TransitionServer"

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

	public async Start(): Promise<void> {
		const server = createServer(
			async (socket) => await this.handleConnection(socket)
		)

		server.listen({ port: this.port, host: this.ip }, async () => {
			await this.logger.writeAsync(
				`Server listening on ${this.ip}:${this.port}`,
				ansiColorCodes.bgGreen
			)
			this.SERVER_STATE = ServerStatus.Online
		})

		server.on("error", (err) => {
			this.logger.write(
				`Error starting server: ${err.message}`,
				ansiColorCodes.red
			)
		})
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

		await TransitionServer.getInstance().send("needServerStatus", "")
	}

	public serialize(message: DofusMessage): Buffer {
		const headerWriter = new BinaryBigEndianWriter({
			maxBufferLength: this.MAX_DOFUS_MESSAGE_HEADER_SIZE,
		})
		const messageWriter = new BinaryBigEndianWriter({
			maxBufferLength: 10240,
		})

		if (!(message?.id in messages)) {
			throw `Undefined message (id: ${message.id})`
		}

		// @ts-ignore
		message.serialize(messageWriter)

		DofusNetworkMessage.writeHeader(headerWriter, message.id, messageWriter)

		this.logger.writeAsync(`Serialized dofus message '${message.id}'`)

		return Buffer.concat([headerWriter.getBuffer(), messageWriter.getBuffer()])
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

	public delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms))
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

					for (const client of this.clients) {
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

					await TransitionServer.getInstance().send(
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
