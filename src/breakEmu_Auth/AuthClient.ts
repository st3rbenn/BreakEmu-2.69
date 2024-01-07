import { RSA_PKCS1_PADDING } from "constants"
import { privateDecrypt } from "crypto"
import { Socket } from "net"
import AuthController from "../breakEmu_API/controller/auth.controller"
import WorldController from "../breakEmu_API/controller/world.controller"
import Account from "../breakEmu_API/model/account.model"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import RSAKeyHandler from "../breakEmu_Core/RSAKeyHandler"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import ServerClient from "../breakEmu_Server/ServerClient"
import WorldServer from "../breakEmu_World/WorldServer"
import WorldServerManager from "../breakEmu_World/WorldServerManager"
import ServerConnectionErrorEnum from "../breakEmu_World/enum/ServerConnectionErrorEnum"
import ServerStatusEnum from "../breakEmu_World/enum/ServerStatusEnum"
import AuthServer from "./AuthServer"
import ServerStatus from "./enum/ServerStatus"

import {
	BasicPingMessage,
	BasicPongMessage,
	BinaryBigEndianReader,
	CredentialsAcknowledgementMessage,
	DofusMessage,
	HelloConnectMessage,
	IdentificationMessage,
	IdentificationSuccessMessage,
	NicknameChoiceRequestMessage,
	ProtocolRequired,
	SelectedServerDataMessage,
	SelectedServerRefusedMessage,
	ServerSelectionMessage,
	ServersListMessage,
	SystemMessageDisplayMessage,
	messages,
} from "../breakEmu_Server/IO"
import AuthTransition from "./AuthTransition"
import NicknameHandlers from "./handlers/NicknameHandlers"

class AuthClient extends ServerClient {
	public logger: Logger = new Logger("AuthClient")

	public _RSAKeyHandler: RSAKeyHandler = RSAKeyHandler.getInstance()

	private _account: Account | null = null

	private authController: AuthController

	public constructor(socket: Socket) {
		super(socket)

		this.authController = new AuthController(this)
	}

	public async initialize(): Promise<void> {
		try {
			if (AuthServer.getInstance().ServerState === ServerStatus.Maintenance) {
				this.logger.write("Sending Maintenance message")
				await this.Send(
					this.serialize(new SystemMessageDisplayMessage(true, 13, []))
				)

				this.OnClose()
				return
			}

			if (ConfigurationManager.getInstance().showProtocolMessage) {
				await this.logger.writeAsync("Sending ProtocolRequired message")
			}
			this.Send(
				this.serialize(
					new ProtocolRequired(
						ConfigurationManager.getInstance().dofusProtocolVersion
					)
				)
			)

			if (ConfigurationManager.getInstance().showProtocolMessage) {
				await this.logger.writeAsync("Sending HelloConnectMessage message")
			}

			this._RSAKeyHandler.generateKeyPair()
			const attrs = this._RSAKeyHandler.getAttribute()
			const encryptedPublicKey = this._RSAKeyHandler.encryptedPublicKey

			this.Send(
				this.serialize(
					new HelloConnectMessage(attrs.salt, Array.from(encryptedPublicKey))
				)
			)

			this.Socket.on(
				"data",
				async (data) => await this.handleData(this.Socket, data, attrs)
			)
		} catch (error) {
			await this.logger.writeAsync(
				`Error initializing client: ${error}`,
				ansiColorCodes.red
			)
		}
	}

	public async handleData(
		socket: Socket,
		data: Buffer,
		attrs: any
	): Promise<void> {
		// if (ConfigurationManager.getInstance().showDebugMessages) {
		// 	await this.logger.writeAsync(
		// 		`Received data from ${socket.remoteAddress}: ${data.toString("hex")}`,
		// 		ansiColorCodes.lightGray
		// 	)
		// }

		const message = this.deserialize(data)

		if (ConfigurationManager.getInstance().showProtocolMessage) {
			await this.logger.writeAsync(
				`Deserialized dofus message '${messages[message.id].name}'`,
				ansiColorCodes.lightGray
			)
		}

		switch (message.id) {
			case IdentificationMessage.id:
				await this.handleIdentificationMessage(attrs, message)
				break
			case NicknameChoiceRequestMessage.id:
				await this.handleNicknameChoiceRequestMessage(message)
				break
			case BasicPingMessage.id:
				await this.Send(this.serialize(new BasicPongMessage()))
				break
			case ServerSelectionMessage.id:
				await this.handleServerSelectionMessage()
		}
	}

	public OnClose(): void {
		AuthServer.getInstance().RemoveClient(this)
		this.logger.write(
			`Client ${this.Socket.remoteAddress}:${this.Socket.remotePort} disconnected`,
			ansiColorCodes.red
		)
	}

	private async handleIdentificationMessage(
		attrs: any,
		message: DofusMessage
	): Promise<void> {
		const clearCredentials = privateDecrypt(
			{
				key: attrs.privateKey,
				padding: RSA_PKCS1_PADDING,
			},
			new Int8Array((message as IdentificationMessage).credentials!)
		)

		const credentialsReader = new BinaryBigEndianReader({
			maxBufferLength: clearCredentials.length,
		}).writeBuffer(clearCredentials)

		credentialsReader.setPointer(credentialsReader.getPointer() + 32)

		const AESKey = credentialsReader.readBuffer(32, true, {
			maxBufferLength: 32,
		})
		const username = credentialsReader.readUTFBytes(
			credentialsReader.readByte()
		)
		const password = credentialsReader.readUTFBytes(
			credentialsReader.getReadableSize()
		)

		if (ConfigurationManager.getInstance().showDebugMessages) {
			await this.logger.writeAsync(
				`AESKey: ${AESKey.toString(
					"hex"
				)}, username: ${username}, password: ${password}`,
				ansiColorCodes.lightGray
			)
		}

		const user = await this.authController.login(username, password)

		// if (user?.pseudo === null) {
		// 	return;
		// }
		this._account = new Account(
			user?.id as number,
			user?.username as string,
			user?.password as string,
			user?.pseudo as string,
			user?.email as string,
			user?.is_verified as boolean,
			user?.firstname as string,
			user?.lastname as string,
			user?.birthdate as Date,
			user?.secretQuestion as string,
			user?.login_at as Date,
			user?.logout_at as Date,
			user?.updated_at as Date,
			user?.created_at as Date,
			user?.deleted_at as Date,
			user?.ip as string,
			user?.role as number,
			user?.is_banned as boolean,
			user?.tagNumber as number
		)

		if (user?.pseudo !== null && user?.pseudo !== "") {
			if (ConfigurationManager.getInstance().showProtocolMessage) {
				await this.logger.writeAsync(
					"Sending CredentialsAknowledgementMessage message"
				)
			}
			await this.Send(this.serialize(new CredentialsAcknowledgementMessage()))
			await this.handleIdentificationSuccessMessage()
			await this.handleServersListMessage()
		}
	}

	private async handleNicknameChoiceRequestMessage(
		message: DofusMessage
	): Promise<void> {
		const nickname = (message as NicknameChoiceRequestMessage).nickname

		if (ConfigurationManager.getInstance().showDebugMessages) {
			await this.logger.writeAsync(
				`Nickname: ${nickname}`,
				ansiColorCodes.lightGray
			)
		}

		const isNicknameDone = await new NicknameHandlers(this).setNickname(
			nickname as string
		)

		if (isNicknameDone) {
			this.logger.write(`isNicknameDone: ${isNicknameDone}`)
			await this.handleIdentificationSuccessMessage()
			await this.handleServersListMessage()
		}
	}

	public async handleIdentificationSuccessMessage(
		wasArleadyConnected: boolean = false
	): Promise<void> {
		const subscriptionEndDateUnix = Math.floor(Date.now() * 1000) + 31536000

		const identificationSuccessMessage = new IdentificationSuccessMessage(
			this._account?.is_admin,
			this._account?.is_admin,
			this._account?.pseudo,
			(this._account?.tagNumber as number).toString(),
			wasArleadyConnected,
			this._account?.username,
			this._account?.id,
			134,
			this._account?.created_at.getTime(),
			subscriptionEndDateUnix,
			0
		)
		this.logger.write("handleIdentificationSuccessMessage")

		if (ConfigurationManager.getInstance().showProtocolMessage) {
			await this.logger.writeAsync(
				"Sending IdentificationSuccessMessage message"
			)
		}

		if (ConfigurationManager.getInstance().showDebugMessages) {
			await this.logger.writeAsync(
				"Sending needServerStatus to transition server"
			)
		}

		await AuthTransition.getInstance().send("needServerStatus", "")
		await this.Send(this.serialize(identificationSuccessMessage))
	}

	public async handleServersListMessage(): Promise<void> {
		if (ConfigurationManager.getInstance().showProtocolMessage) {
			await this.logger.writeAsync("Sending ServersListMessage message")
		}

		const gameServerInformationArray = await WorldServerManager.getInstance().gameServerInformationArray(
			this
		)

		this.Send(
			this.serialize(new ServersListMessage(gameServerInformationArray, true))
		)
	}

	public async handleServerSelectionMessage(): Promise<void> {
		const server = WorldController.getInstance().worldList

		if (server.length <= 0) {
			await this.Send(
				this.serialize(
					new SelectedServerRefusedMessage(
						server[0].worldServerData?.Id,
						ServerConnectionErrorEnum.SERVER_CONNECTION_ERROR_NO_REASON,
						0
					)
				)
			)
			return
		}

		if (server[0].SERVER_STATE != ServerStatusEnum.ONLINE) {
			await this.Send(
				this.serialize(
					new SelectedServerRefusedMessage(
						server[0].worldServerData?.Id,
						ServerConnectionErrorEnum.SERVER_CONNECTION_ERROR_DUE_TO_STATUS,
						0
					)
				)
			)
			return
		}

		if (
			(server[0].worldServerData?.RequiredRole as number) >
			(this._account?.role as number)
		) {
			await this.Send(
				this.serialize(
					new SelectedServerRefusedMessage(
						server[0].worldServerData?.Id,
						ServerConnectionErrorEnum.SERVER_CONNECTION_ERROR_ACCOUNT_RESTRICTED,
						0
					)
				)
			)
			return
		}

		await this.sendSelectServerData(this, server[0])
	}

	async sendSelectServerData(client: AuthClient, server: WorldServer) {
		if (!server || !client.canAccessWorld(server)) {
			return
		}

		const token: number[] = Buffer.from(
			[...Array(32)].map(() => Math.random().toString(36)[2]).join("")
		).toJSON().data

		const selectedServerDataMessage = new SelectedServerDataMessage(
			server.worldServerData?.Id,
			server.worldServerData?.Address,
			[server.worldServerData?.Port as number, 5555],
			true,
			token
		)

		await client.Send(client.serialize(selectedServerDataMessage))

		await AuthTransition.getInstance().sendAccountTransferMessage(
			this._account?.pseudo as string
		)

		await client.disconnect()
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

	public get account(): Account | null {
		return this._account
	}
}

export default AuthClient
