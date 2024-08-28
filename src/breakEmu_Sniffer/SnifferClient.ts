import { Socket } from "net"
import Account from "@breakEmu_API/model/account.model"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import RSAKeyHandler from "@breakEmu_Core/RSAKeyHandler"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import { DofusMessage } from "@breakEmu_Server/IO"
import ServerClient from "@breakEmu_Server/ServerClient"

import { messages } from "@breakEmu_Server/IO"

export type Attributes = {
	publicKey: string
	privateKey: string
	salt: string
}

class SnifferClient extends ServerClient {
	public logger: Logger = new Logger("SnifferClient")

	public _RSAKeyHandler: RSAKeyHandler = RSAKeyHandler.getInstance()

	private _account: Account | null = null

	public constructor(socket: Socket) {
		super(socket)
	}

	public async initialize(): Promise<void> {
		try {
			this.Socket.on("data", async (data) => await this.handleData(data))
		} catch (error) {
			await this.logger.writeAsync(
				`Error initializing client: ${error}`,
				ansiColorCodes.red
			)
		}
	}

	public async handleData(data: Buffer, attrs?: Attributes): Promise<void> {
		const message = this.deserialize(data) as DofusMessage

		if (ConfigurationManager.getInstance().showProtocolMessage) {
			await this.logger.writeAsync(
				`Deserialized dofus message '${messages[message.id].name}'`,
				ansiColorCodes.lightGray
			)
		}
	}

	public OnClose(): void {
		this.logger.write(
			`Client ${this.Socket.remoteAddress}:${this.Socket.remotePort} disconnected`,
			ansiColorCodes.red
		)
	}

	public async disconnect() {
		this.Socket.end()
	}
}

export default SnifferClient
