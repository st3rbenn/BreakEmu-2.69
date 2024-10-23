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
import WorldServerManager from "./WorldServerManager"
import Database from "@breakEmu_API/Database"
import ContextHandler from "./handlers/ContextHandler"
// import WorldMain from "../WorldMain"

class WorldServer {
	public logger: Logger = new Logger("WorldServer")
	public SERVER_STATE: number = ServerStatusEnum.OFFLINE

	public worldServerData: WorldServerData

	private container: Container = Container.getInstance()
	private worldTransition = this.container.get(WorldTransition)

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

		await this.container
			.get(WorldTransition)
			.handleServerStatusUpdate(
				this.worldServerData.Id,
				this.SERVER_STATE.toString()
			)
		this.container.register(WorldServer, this)

		this.container
			.get(TaskManager)
			.saveTaskHandler()
			.setCron("*/30 * * * *")
			.run()
		this.container
			.get(TaskManager)
			.averagePriceHandler()
			.setCron("*/5 * * * *")
			.run()
		this.container.get(TaskManager).elementBonusHandler()
	}

	private async saveAllCharacters(): Promise<void> {
		this.logger.info(`Saving all characters...`)
		for (const client of this.clients.values()) {
			if (client?.selectedCharacter) {
				this.logger.info(`Saving character ${client.selectedCharacter.name}`)
				await this.container
					.get(CharacterController)
					.updateCharacter(client.selectedCharacter)
			}
		}
	}

	public async save(): Promise<void> {
		await this.sendReplyToAllPlayers("Serveur en cours de sauvegarde...")
		await this.worldTransition.handleServerStatusUpdate(
			World.worlds[0].toWorldServerData().Id,
			ServerStatusEnum.SAVING.toString()
		)
		await this.saveAllCharacters()

		this.logger.info(`Server saved!`)
		await this.sendReplyToAllPlayers("Sauvegarde du serveur terminée.")
		await this.worldTransition.handleServerStatusUpdate(
			World.worlds[0].toWorldServerData().Id,
			ServerStatusEnum.ONLINE.toString()
		)
	}

	public async restart(): Promise<void> {
		console.log("Restarting server...")
		const worldServerManager = this.container.get(WorldServerManager)
		const database = this.container.get(Database)

		await this.save()

		await this.worldTransition.handleServerStatusUpdate(
			World.worlds[0].toWorldServerData().Id,
			ServerStatusEnum.OFFLINE.toString()
		)
		await worldServerManager._realmList[0].Stop()
		await database.prisma.$disconnect()
		await this.worldTransition.disconnect()
	}

	public async Stop(): Promise<void> {
		this.logger.write(`Stopping server ${this.worldServerData.Name}`)
		this.SERVER_STATE = ServerStatusEnum.STOPING
		this._server?.close(() => {
			this.SERVER_STATE = ServerStatusEnum.OFFLINE
		})

		await this.container
			.get(WorldTransition)
			.handleServerStatusUpdate(
				this.worldServerData.Id,
				ServerStatusEnum.OFFLINE.toString()
			)

		// Stop scheduled tasks
		this.container.get(TaskManager).stopAllTasks()
	}

	private async handleConnection(socket: Socket): Promise<void> {
		this.logger.write(`New connection from ${socket.remoteAddress}`)
		const worldClient = await this.container
			.get(WorldTransition)
			.handleAccountTransition(socket)

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
			if (client.selectedCharacter) {
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

	public async sendAveragePricesToAllPlayers(): Promise<void> {
		for (const client of this.clients.values()) {
			await ContextHandler.handleObjectAveragePricesGetMessage(client)
		}
	}

	private async sendReplyToAllPlayers(message: string): Promise<void> {
		try {
			for (const client of this.clients.values()) {
				await client.selectedCharacter?.replyWarning(message)
			}
		} catch (error) {
			this.logger.error(`Error while sending message to all players`)
		}
	}
}

export default WorldServer
