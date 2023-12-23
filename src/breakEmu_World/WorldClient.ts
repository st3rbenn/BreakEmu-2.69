import { ConsumeMessage } from "amqplib"
import { Socket } from "net"
import CharacterController from "../breakEmu_API/controller/character.controller"
import UserController from "../breakEmu_API/controller/user.controller"
import Account from "../breakEmu_API/model/account.model"
import Character from "../breakEmu_API/model/character.model"
import TransitionManager from "../breakEmu_Auth/TransitionServer"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import {
	AuthenticationTicketAcceptedMessage,
	AuthenticationTicketMessage,
	BinaryBigEndianReader,
	BinaryBigEndianWriter,
	CharacterBaseInformations,
	CharacterCreationRequestMessage,
	CharacterDeletionPrepareMessage,
	CharacterDeletionPrepareRequestMessage,
	CharactersListMessage,
	CharactersListRequestMessage,
	DofusMessage,
	DofusNetworkMessage,
	EntityLook,
	HelloGameMessage,
	ProtocolRequired,
	ReloginTokenRequestMessage,
	ReloginTokenStatusMessage,
	messages,
} from "../breakEmu_Server/IO"
import ServerClient from "../breakEmu_Server/ServerClient"
import WorldServer from "./WorldServer"

class WorldClient extends ServerClient {
	public logger: Logger = new Logger("WorldClient")

	public MAX_DOFUS_MESSAGE_HEADER_SIZE: number = 10

	private _account: Account | null = null
	private _characters: Character[] = []

	private _server: WorldServer

	public constructor(socket: Socket, server: WorldServer) {
		super(socket)
		this._server = server
	}

	public async setupEventHandlers(): Promise<void> {
		return await new Promise<void>((resolve, reject) => {
			this.Socket.on("end", () => this.OnClose())
			this.Socket.on("error", (error) => {
				this.logger.write(`Error: ${error.message}`, ansiColorCodes.red)
			})

			resolve()
		})
	}

	public OnClose(): void {
		this._server.RemoveClient(this)
	}

	public async initialize(): Promise<void> {
		if (ConfigurationManager.getInstance().showProtocolMessage) {
			await this.logger.writeAsync("Sending ProtocolRequired message")
		}
		await this.Send(
			this.serialize(
				new ProtocolRequired(
					ConfigurationManager.getInstance().dofusProtocolVersion
				)
			)
		)

		if (ConfigurationManager.getInstance().showProtocolMessage) {
			await this.logger.writeAsync("Sending HelloGameMessage message")
		}
		await this.Send(this.serialize(new HelloGameMessage()))

		await TransitionManager.getInstance().receive(
			"accountTransfer",
			async (msg: ConsumeMessage | null) => {
				if (msg) {
					const message = JSON.parse(msg.content.toString())

					const client = await new UserController().getAccountByNickname(
						message.pseudo
					)

					if (client) {
						this.account = client
					}
				}
			}
		)

		this.Socket.on(
			"data",
			async (data) => await this.handleData(this.Socket, data)
		)
	}

	public async handleData(socket: Socket, data: Buffer): Promise<void> {
		if (ConfigurationManager.getInstance().showDebugMessages) {
			await this.logger.writeAsync(
				`Received data from ${socket.remoteAddress}: ${data.toString("hex")}`,
				ansiColorCodes.lightGray
			)
		}

		const message = this.deserialize(data)

		if (ConfigurationManager.getInstance().showProtocolMessage) {
			await this.logger.writeAsync(
				`Deserialized dofus message '${message.id}'`,
				ansiColorCodes.lightGray
			)
		}

		switch (message.id) {
			case AuthenticationTicketMessage.id:
				await this.logger.writeAsync(
					`Received AuthenticationTicketMessage message`,
					ansiColorCodes.lightGray
				)
				await this.Send(
					this.serialize(new AuthenticationTicketAcceptedMessage())
				)
				break
			case CharactersListRequestMessage.id:
				await this.handleCharactersListMessage()
				break
			case CharacterCreationRequestMessage.id:
				await this.handleCharacterCreationRequestMessage(
					message as CharacterCreationRequestMessage
				)
				break
			case ReloginTokenRequestMessage.id:
				await this.logger.writeAsync(
					`Received ReloginTokenRequestMessage message`,
					ansiColorCodes.lightGray
				)
				this.Send(this.serialize(new ReloginTokenStatusMessage(false, "")))
				break
			case CharacterDeletionPrepareRequestMessage.id:
				await this.logger.writeAsync(
					`Received CharacterDeletionPrepareRequestMessage message`,
					ansiColorCodes.lightGray
				)
				const msg = message as CharacterDeletionPrepareRequestMessage

				const currCharacter = this._characters.find(
					(c) => c.id === msg.characterId
				)

				if (!currCharacter) {
					await this.logger.writeAsync(
						`Character ${msg.characterId} not found`,
						ansiColorCodes.red
					)
					return
				}

				//console log the character to delete
				await this.logger.writeAsync(
					`Character ${currCharacter.name} found, id: ${currCharacter.id},, question: ${this._account?.secretQuestion}`,
					ansiColorCodes.bgGreen
				)

				const buff = this.serialize(
					new CharacterDeletionPrepareMessage(
						currCharacter?.id as number,
						currCharacter?.name as string,
						this._account?.secretQuestion as string,
						true
					)
				)

				this.Send(buff)
				break
		}
	}

	private async handleCharactersListMessage() {
		await this.logger.writeAsync(
			`Received CharactersListRequestMessage message`,
			ansiColorCodes.lightGray
		)
		if (this.account) {
			const characters = await new CharacterController().getCharactersByAccountId(
				this.account?.id
			)

			if (characters) {
				this._characters = characters
			}

			let charactersList: CharacterBaseInformations[] = []

			for (const c of this._characters) {
				const baseChar = new CharacterBaseInformations(
					c.id,
					c.name,
					1,
					new EntityLook(15, [1, 10, 135], c.colors, [50, 100], []),
					c.breed,
					c.sex
				)
				charactersList.push(baseChar)
			}

			await this.Send(
				this.serialize(
					new CharactersListMessage(charactersList ? charactersList : [], false)
				)
			)
		}
	}

	private async handleCharacterCreationRequestMessage(
		message: CharacterCreationRequestMessage
	) {
		await this.logger.writeAsync(
			`Received CharacterCreationRequestMessage message`,
			ansiColorCodes.lightGray
		)

		await this.logger.writeAsync(
			`trying to create character ${message.name}`,
			ansiColorCodes.bgMagenta
		)

		const newCharacter = await new CharacterController().createCharacter(
			message,
			this
		)

		if (newCharacter) {
			this._characters.push(newCharacter)

			let charactersList: CharacterBaseInformations[] = []

			for (const c of this._characters) {
				const baseChar = new CharacterBaseInformations(
					c.id,
					c.name,
					1,
					new EntityLook(15, [1, 10, 135], c.colors, [1], []),
					c.breed,
					c.sex
				)
				charactersList.push(baseChar)
			}

			await this.Send(
				this.serialize(
					new CharactersListMessage(charactersList ? charactersList : [], false)
				)
			)
		}
	}

	public get account(): Account | null {
		return this._account
	}

	public set account(account: Account | null) {
		this._account = account
	}

	public deserialize(data: Buffer): DofusMessage {
		const reader = new BinaryBigEndianReader({
			maxBufferLength: data.length,
		}).writeBuffer(data)

		const {
			messageId,
			instanceId,
			payloadSize,
		} = DofusNetworkMessage.readHeader(reader)

		if (ConfigurationManager.getInstance().showProtocolMessage) {
			this.logger.write(`messageId: ${messageId}`)
		}

		if (
			!(messageId in messages) &&
			ConfigurationManager.getInstance().showProtocolMessage
		) {
			this.logger.writeAsync(
				`Undefined message (id: ${messageId})`,
				ansiColorCodes.red
			)
		}

		const message = new messages[messageId]()
		message.deserialize(reader)

		if (ConfigurationManager.getInstance().showProtocolMessage) {
			this.logger.write(`messageId: ${messageId}, ${JSON.stringify(message)}`)
		}

		return message
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

		if (ConfigurationManager.getInstance().showProtocolMessage) {
			this.logger.write(`Serialized dofus message '${message.id}'`)
		}

		return Buffer.concat([headerWriter.getBuffer(), messageWriter.getBuffer()])
	}
}

export default WorldClient
