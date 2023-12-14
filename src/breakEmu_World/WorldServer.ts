import Logger from "../breakEmu_Core/Logger"
import ServerClient from "../breakEmu_Server/ServerClient"
import { Socket, createServer } from "net"
import WorldServerData from "./WorldServerData"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import ServerStatus from "../breakEmu_Auth/enum/ServerStatus"

class WorldServer {
	public logger: Logger = new Logger("WorldServer")

	public SERVER_STATE: number = ServerStatus.Offline

	public worldServerData: WorldServerData

	public constructor(worldServerData: WorldServerData) {
		this.worldServerData = worldServerData 
	}

	public async Start(): Promise<void> {
		const server = createServer(
			async (socket) => await this.handleConnection(socket)
		)

		return new Promise((resolve, reject) => {
			server.listen(
				{ port: this.worldServerData.Port, host: this.worldServerData.Address },
				async () => {
					await this.logger.writeAsync(
						`Server listening on ${this.worldServerData.Address}:${this.worldServerData.Port}`
					)
					this.SERVER_STATE = ServerStatus.Online

					resolve()
				}
			)

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
			this.logger.write(`New connection from ${socket.remoteAddress}`)
			// const client = new AuthClient(socket)
			// await this.AddClient(client) // Attendre l'ajout et l'initialisation du client
			// // Configurer les gestionnaires d'événements après l'initialisation
			// await client.setupEventHandlers()

			// await client.initialize()

			resolve()
		})
	}
}

export default WorldServer
