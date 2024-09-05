import { Connection } from "amqplib"
import { Socket } from "net"
import UserController from "@breakEmu_API/controller/user.controller"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import TransitionServer from "@breakEmu_Server/TransitionServer"
import WorldClient from "./WorldClient"
import WorldServer from "./WorldServer"

class WorldTransition extends TransitionServer {
	logger: Logger = new Logger("WorldTransition")
	connection: Connection | null = null

	constructor(uri: string) {
		super(uri)
	}

	public async handleAccountTransition(
		socket: Socket
	): Promise<WorldClient | null> {
		try {
			const accountReceived = await this.receiveAndDeleteAccountTransfer()
			if (!accountReceived?.pseudo) {
				throw new Error("No account transfer data found")
			}

			this.logger.write(
				`Received account transfer request for ${accountReceived?.pseudo}`,
				ansiColorCodes.dim
			)

			if (accountReceived?.ipAddress == socket.remoteAddress) {
				return new WorldClient(socket, accountReceived?.pseudo)
			} else {
				this.tryNextAccountTransfer(accountReceived)
			}

			return null
		} catch (error) {
			await this.logger.writeAsync(
				`Error while handling account transition: ${(error as any).message}`,
				ansiColorCodes.red
			)
			return Promise.resolve(null)
		}
	}

	private async tryNextAccountTransfer(accountReceived: {
		pseudo: string
		ipAddress: string
	}): Promise<{
		pseudo: string
		ipAddress: string
	} | null> {
		const account = await this.receiveAndDeleteAccountTransfer()
		if (account?.pseudo) {
			this.logger.write(
				`Received account transfer request for ${account?.pseudo}`,
				ansiColorCodes.dim
			)
		} else {
			this.logger.write(
				`No account transfer data found for ${accountReceived.pseudo}`,
				ansiColorCodes.dim
			)
		}

		return account
	}

	private async receiveAndDeleteAccountTransfer(): Promise<{
		pseudo: string
		ipAddress: string
	} | null> {
		const keys = await this.redisClient?.keys("accountTransfer:*")
		if (!keys || keys.length === 0) return null

		const key = keys[0]
		const value = await this.redisClient?.get(key)
		await this.deleteKey(key)

		if (!value) return null

		const message = JSON.parse(value)
		const res = { pseudo: message.pseudo, ipAddress: message.ipAddress }

		return res
	}

	async handleServerStatusUpdate(serverId: number, status: string) {
		await this.publish(
			"ServerStatusUpdateChannel",
			JSON.stringify({
				serverId: serverId,
				status: status,
			})
		)
	}
}

export default WorldTransition
