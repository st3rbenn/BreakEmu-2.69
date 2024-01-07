import CharacterController from "../../../breakEmu_API/controller/character.controller"
import { ansiColorCodes } from "../../../breakEmu_Core/Colors"
import Logger from "../../../breakEmu_Core/Logger"
import {
	CharacterDeletionErrorEnum,
	CharacterDeletionErrorMessage,
	CharacterDeletionPrepareMessage,
	CharacterDeletionPrepareRequestMessage,
	CharacterDeletionRequestMessage,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../WorldClient"
import CharacterListHandler from "./CharacterListHandler"

class CharacterDeletionHandler {
	private static logger: Logger = new Logger("CharacterDeletionHandler")

	private static _characterController = new CharacterController()

	public static async handleCharacterDeletionPrepareRequest(
		message: CharacterDeletionPrepareRequestMessage,
		client: WorldClient
	) {
		await this.logger.writeAsync(
			`Received CharacterDeletionPrepareRequestMessage message`,
			ansiColorCodes.lightGray
		)
		const msg = message as CharacterDeletionPrepareRequestMessage

		const currCharacter = client.account?.characters.get(msg.characterId as number)

		if (!currCharacter) {
			await this.logger.writeAsync(
				`Character ${msg.characterId} not found`,
				ansiColorCodes.red
			)

			await client.Send(
				client.serialize(
					new CharacterDeletionErrorMessage(
						CharacterDeletionErrorEnum.DEL_ERR_NO_REASON
					)
				)
			)
			return
		}
		//console log the character to delete
		const t = {
			characterId: currCharacter?.id as number,
			characterName: currCharacter?.name as string,
			secretQuestion: client.account?.secretQuestion as string,
			needSecretAnswer: false,
		}

		await client.Send(
			client.serialize(
				new CharacterDeletionPrepareMessage(
					t.characterId,
					t.characterName,
					t.secretQuestion,
					t.needSecretAnswer
				)
			)
		)
	}

	public static async handleCharacterDeletionMessage(
		client: WorldClient,
		message: CharacterDeletionRequestMessage
	) {
		await this.logger.writeAsync(
			`Received CharacterDeletionRequestMessage message`,
			ansiColorCodes.lightGray
		)
		const msg = message as CharacterDeletionRequestMessage

		const currCharacter = client.account?.characters.get(msg.characterId as number)

		if (!currCharacter) {
			await this.logger.writeAsync(
				`Character ${msg.characterId} not found`,
				ansiColorCodes.red
			)

			await client.Send(
				client.serialize(
					new CharacterDeletionErrorMessage(
						CharacterDeletionErrorEnum.DEL_ERR_NO_REASON
					)
				)
			)
			return
		}

		const isDeleted = await this._characterController.deleteCharacter(
			Number(msg.characterId),
			Number(client.account?.id)
		)
		if (isDeleted) {
			await this.logger.writeAsync(
        `Character ${msg.characterId} deleted`,
        ansiColorCodes.bgGreen
      )
      client.account?.characters.delete(msg.characterId as number)
		}

		await CharacterListHandler.handleCharactersListMessage(client)
	}
}

export default CharacterDeletionHandler
