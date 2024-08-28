import CharacterCreationResultEnum from "@breakEmu_World/enum/CharacterCreationResultEnum"
import CharacterController from "@breakEmu_API/controller/character.controller"
import Account from "@breakEmu_API/model/account.model"
import Character from "@breakEmu_API/model/character.model"
import ansiColorCodes from "@breakEmu_Core/Colors"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import Logger from "@breakEmu_Core/Logger"
import {
	CharacterBaseInformations,
	CharacterCanBeCreatedRequestMessage,
	CharacterCanBeCreatedResultMessage,
	CharacterCapabilitiesMessage,
	CharacterCreationRequestMessage,
	CharacterCreationResultMessage,
	CharacterDeletionErrorEnum,
	CharacterDeletionErrorMessage,
	CharacterDeletionPrepareMessage,
	CharacterDeletionPrepareRequestMessage,
	CharacterDeletionRequestMessage,
	CharacterLevelUpInformationMessage,
	CharacterLevelUpMessage,
	CharacterSelectedSuccessMessage,
	CharactersListMessage,
	NotificationListMessage,
	PopupWarningClosedMessage,
	SequenceNumberRequestMessage,
} from "@breakEmu_Protocol/IO"
import WorldClient from "../../WorldClient"

class CharacterHandler {
	private static logger: Logger = new Logger("CharacterHandler")

	public static async sendCharacterLevelUpMessage(
		client: WorldClient,
		currentLevel: number
	) {
		await client.Send(new CharacterLevelUpMessage(currentLevel))
	}

	public static async sendCharacterLevelUpInformationMessage(
		client: WorldClient,
		character: Character,
		currentLevel: number
	) {
		await client.Send(
			new CharacterLevelUpInformationMessage(
				currentLevel,
				character.name,
				character.id
			)
		)
	}

	public static async handleCharacterSelectionMessage(
		character: Character,
		client: WorldClient
	) {
		client.setSelectedCharacter(character)
		try {
			await client.Send(
				new CharacterSelectedSuccessMessage(
					character?.toCharacterBaseInformations(),
					false
				)
			)
			await client.Send(new NotificationListMessage([2147483647]))
			await client.Send(new CharacterCapabilitiesMessage(4095))
			await client.Send(new SequenceNumberRequestMessage())

      client.selectedCharacter.testIfCharacterDataIsValid()
      
			await client.selectedCharacter.refreshAll()

			// await character.inventory?.addNewItem(8464, 1, false)
		} catch (error) {
			this.logger.write(
				`Error in handleCharacterSelectionMessage: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	public static async handleCharactersListMessage(client: WorldClient) {
		try {
      this.logger.write(
        `try retrieve characters for account: ${client.account?.username}`,
        ansiColorCodes.bgYellow
      )
			let characters = client.account.characters

			let characterToBaseInfo: CharacterBaseInformations[] = []

			this.logger.write(
				`Sending: ${characters?.size} characters for client: ${client.account?.username}`,
				ansiColorCodes.bgYellow
			)

			if (characters) {
				characters.forEach((c: Character) => {
					characterToBaseInfo.push(c.toCharacterBaseInformations())
				})
			} else {
				this.logger.write(
					`No characters found for account ${client.account?.username}`,
					ansiColorCodes.bgYellow
				)
			}

			await client.Send(new CharactersListMessage(characterToBaseInfo))
		} catch (error) {
			await this.logger.writeAsync(
				`Error while handling CharactersListMessage: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	public static async handleCharacterDeletionPrepareRequest(
		message: CharacterDeletionPrepareRequestMessage,
		client: WorldClient
	) {
		try {
			await this.logger.writeAsync(
				`Received CharacterDeletionPrepareRequestMessage message`,
				ansiColorCodes.lightGray
			)
			const msg = message as CharacterDeletionPrepareRequestMessage

			const currCharacter = client.account?.characters.get(
				msg.characterId as number
			)

			if (!currCharacter) {
				await this.logger.writeAsync(
					`Character ${msg.characterId} not found`,
					ansiColorCodes.red
				)

				await client.Send(
					new CharacterDeletionErrorMessage(
						CharacterDeletionErrorEnum.DEL_ERR_NO_REASON
					)
				)
				return
			}
			//console log the character to delete
			const characterToDelete = {
				characterId: currCharacter?.id as number,
				characterName: currCharacter?.name as string,
				secretQuestion: client.account?.secretQuestion as string,
				needSecretAnswer: false,
			}

			await client.Send(
				new CharacterDeletionPrepareMessage(
					characterToDelete.characterId,
					characterToDelete.characterName,
					characterToDelete.secretQuestion,
					characterToDelete.needSecretAnswer
				)
			)
		} catch (error) {
			await this.logger.writeAsync(
				`Error while handling CharacterDeletionPrepareRequestMessage: ${
					(error as any).stack
				}`,
				ansiColorCodes.red
			)
		}
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

		const currCharacter = client.account?.characters.get(
			msg.characterId as number
		)

		if (!currCharacter) {
			await this.logger.writeAsync(
				`Character ${msg.characterId} not found`,
				ansiColorCodes.red
			)

			await client.Send(
				new CharacterDeletionErrorMessage(
					CharacterDeletionErrorEnum.DEL_ERR_NO_REASON
				)
			)
			return
		}

		const isDeleted = await CharacterController.getInstance().deleteCharacter(
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

		await this.handleCharactersListMessage(client)
	}

	public static async handleCharacterCreationRequestMessage(
		message: CharacterCreationRequestMessage,
		client: WorldClient
	) {
		try {
			const character = await CharacterController.getInstance().createCharacter(
				message,
				client.account as Account
			)

			await client.Send(new CharacterCreationResultMessage(0, 0))
			this.logger.write(
				`Character ${character.name} created`,
				ansiColorCodes.bgGreen
			)

			// Utiliser Promise.all pour attendre que tous les items soient ajoutés
			await Promise.all(
				ConfigurationManager.instance.itemStarter.map(async (itemGid) => {
					await character.inventory.addNewItem(itemGid)
				})
			)

			await CharacterController.getInstance().updateCharacter(character)

			client.account?.characters.set(character.id, character)
			character.account = client.account

			client.selectedCharacter = character

			await this.handleCharacterSelectionMessage(character, client)
		} catch (error) {
			this.logger.write(
				`Error in handleCharacterCreationRequestMessage: ${
					(error as any).message
				}`,
				ansiColorCodes.red
			)
			await client.Send(
				new CharacterCreationResultMessage(
					1,
					CharacterCreationResultEnum.ERR_NO_REASON
				)
			)
		}
	}

	public static async CharacterCanBeCreatedRequestMessage(
		message: CharacterCanBeCreatedRequestMessage,
		client: WorldClient
	) {
		await client.Send(new CharacterCanBeCreatedResultMessage(true))
		await client.Send(new PopupWarningClosedMessage())
	}
}

export default CharacterHandler
