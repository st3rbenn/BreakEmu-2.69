import { genSaltSync, hashSync } from "bcrypt"
import Logger from "./breakEmu_Core/Logger"
import { Socket } from "net"
import ConnectionQueue from "./breakEmu_Auth/ConnectionQueue"

class Playground {
	public logger: Logger = new Logger("Playground")

	messageId: number = 0

	public async main(): Promise<void> {
		/**
		 * Generate Password ⬇
		 * const salt = genSaltSync(10)
		 * const hash = hashSync("admin", salt)
		 * this.logger.write(hash)
		 */

		const arrayOfSocket: Socket[] = []

		const socket = new Socket({
			readable: true,
			writable: true,
			allowHalfOpen: false,
		})

		for (let i = 0; i < 10; i++) {
			arrayOfSocket.push(socket)
		}

		await this.sendDataWithVariableDelay(arrayOfSocket, 50)
	}

	async sendDataWithVariableDelay<D>(
		data: D[],
		startDelay: number
	): Promise<void> {
		for (let i = 0; i < data.length; i++) {
			await new Promise((resolve) => setTimeout(resolve, startDelay))
			ConnectionQueue.getInstance().enqueue(data[i] as Socket)
		}
	}
}

export default Playground

new Playground().main()
