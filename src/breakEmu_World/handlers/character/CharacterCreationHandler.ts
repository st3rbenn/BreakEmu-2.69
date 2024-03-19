import Database from "../../../breakEmu_API/Database"
import CharacterController from "../../../breakEmu_API/controller/character.controller"
import Account from "../../../breakEmu_API/model/account.model"
import { ansiColorCodes } from "../../../breakEmu_Core/Colors"
import Logger from "../../../breakEmu_Core/Logger"
import {
  CharacterCanBeCreatedRequestMessage,
  CharacterCanBeCreatedResultMessage,
  CharacterCreationRequestMessage,
  CharacterCreationResultMessage,
  PopupWarningClosedMessage,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../WorldClient"
import CharacterListHandler from "./CharacterListHandler"

class CharacterCreationHandler {
	private static logger: Logger = new Logger("CharacterCreationHandler")
	private static _characterController = new CharacterController()
	private static _database: Database

	public static async handleCharacterCreationRequestMessage(
		message: CharacterCreationRequestMessage,
		client: WorldClient
	) {
		this._characterController.createCharacter(
			message,
			client.account as Account,
			async (reason) => {
				await client.Send(
					new CharacterCreationResultMessage(1, reason)
				)
			},
			async (character) => {
				await client.Send(
					new CharacterCreationResultMessage(0, 0)
				)
				this.logger.writeAsync(
					`Character ${character.name} created`,
					ansiColorCodes.bgGreen
				)

				const itemStarterPack = [
					10784,
					10785,
					10794,
					10798,
					10799,
					10800,
					10801,
				]

				itemStarterPack.map(async (itemGid) => {
					await character.inventory.addNewItem(itemGid)
					// const item = await character.inventory.addNewItem(itemGid)
					// await CharacterItem.addItem(item as CharacterItem)
				})

				await this._characterController.updateCharacter(character)

				client.account?.characters.set(character.id, character)
        character.account = client.account

				client.selectedCharacter = character

				await CharacterListHandler.handleCharactersListMessage(client)
			}
		)
	}

	public static async CharacterCanBeCreatedRequestMessage(
		message: CharacterCanBeCreatedRequestMessage,
		client: WorldClient
	) {
		await client.Send(
      new CharacterCanBeCreatedResultMessage(true)
    )
    await client.Send(new PopupWarningClosedMessage())
	}
}

export default CharacterCreationHandler
