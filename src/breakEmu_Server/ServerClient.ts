import { Socket } from "net"
import Logger from "../breakEmu_Core/Logger"
import { ansiColorCodes } from "../breakEmu_Core/Colors"

class ServerClient {
	public logger: Logger = new Logger("ServerClient")
	private socket: Socket

	constructor(socket: Socket) {
		this.socket = socket
	}

	public get Socket(): Socket {
		return this.socket
	}

	public async Send(messageData: Buffer): Promise<void> {
		return await new Promise<void>(async (resolve, reject) => {
			if (!this.socket || !this.socket.writable) {
				throw new Error("Socket is not writable")
			}

			try {
        this.socket.write(messageData)
				resolve()
			} catch (error) {
				await this.logger.writeAsync(
					`Error sending message: ${error}`,
					ansiColorCodes.red
				)
				reject(error)
			}
		})
	}
}

export default ServerClient
