import { Socket } from "net"
import Account from "@breakEmu_API/model/account.model"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import RSAKeyHandler from "@breakEmu_Core/RSAKeyHandler"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import ServerClient from "@breakEmu_Server/ServerClient"
import WorldServer from "@breakEmu_World/WorldServer"
import AuthServer from "./AuthServer"
import ServerStatus from "./enum/ServerStatus"

import {
	BasicPingMessage,
	BasicPongMessage,
	DofusMessage,
	HelloConnectMessage,
	IdentificationMessage,
	NicknameChoiceRequestMessage,
	ProtocolRequired,
	ServerSelectionMessage,
	SystemMessageDisplayMessage,
	messages,
} from "@breakEmu_Protocol/IO"
import AuthentificationHandler from "./handlers/auth/AuthentificationHandler"
import NicknameHandlers from "./handlers/nickname/NicknameHandlers"
import ServerListHandler from "./handlers/server/ServerListHandler"
import Container from "@breakEmu_Core/container/Container"

export type Attributes = {
	publicKey: string
	privateKey: string
	salt: string
}

class AuthClient extends ServerClient {
	public logger: Logger = new Logger("AuthClient")

	public _RSAKeyHandler: RSAKeyHandler = RSAKeyHandler.getInstance()
  public ipAddress: string = ""
	public account: Account

	public constructor(socket: Socket) {
		super(socket)
	}

	public async initialize(): Promise<void> {
		try {
			if (
				this.container.get(AuthServer).ServerState === ServerStatus.Maintenance
			) {
				this.logger.write("Sending Maintenance message")
				await this.Send(new SystemMessageDisplayMessage(true, 13, []))

				this.OnClose()
				return
			}

			await this.Send(
				new ProtocolRequired(
					this.container.get(ConfigurationManager).dofusProtocolVersion
				)
			)

			this._RSAKeyHandler.generateKeyPair()
			const attrs = this._RSAKeyHandler.getAttribute()
			const encryptedPublicKey = this._RSAKeyHandler.encryptedPublicKey

			await this.Send(
				new HelloConnectMessage(attrs.salt, Array.from(encryptedPublicKey))
			)

			this.Socket.on("data", async (data) => await this.handleData(data, attrs))
      this.ipAddress = this.Socket.remoteAddress as string
		} catch (error) {
			await this.logger.writeAsync(
				`Error initializing client: ${error}`,
				ansiColorCodes.red
			)
		}
	}

	public async handleData(data: Buffer, attrs: Attributes): Promise<void> {
		const message = this.deserialize(data) as DofusMessage

		if (this.container.get(ConfigurationManager).showProtocolMessage) {
			await this.logger.writeAsync(
				`Deserialized dofus message '${messages[message.id].name}'`,
				ansiColorCodes.lightGray
			)
		}

		switch (message.id) {
			case IdentificationMessage.id:
				await AuthentificationHandler.handleIdentificationMessage(
					attrs,
					message,
					this
				)
				break
			case NicknameChoiceRequestMessage.id:
				await NicknameHandlers.handleNicknameChoiceRequestMessage(message, this)
				break
			case BasicPingMessage.id:
				await this.Send(new BasicPongMessage())
				break
			case ServerSelectionMessage.id:
				await ServerListHandler.handleServerSelectionMessage(this)
		}
	}

	public OnClose(): void {
		this.container.get(AuthServer).RemoveClient(this)
		this.logger.write(
			`Client ${this.Socket.remoteAddress}:${this.Socket.remotePort} disconnected`,
			ansiColorCodes.red
		)
	}

	public canAccessWorld(server: WorldServer): boolean {
		const isAccessGranted =
			(this?.account?.role as number) >=
				(server.worldServerData?.RequiredRole as number) &&
			this.account?.is_verified &&
			this.account?.is_banned === false

		if (!isAccessGranted) {
			this.logger.writeAsync(
				`User ${this.account?.username} tried to access server ${server.worldServerData?.Id} but was denied`,
				ansiColorCodes.red
			)
		}

		return isAccessGranted as boolean
	}

	public async disconnect() {
		this.Socket.end()
	}
}

export default AuthClient
