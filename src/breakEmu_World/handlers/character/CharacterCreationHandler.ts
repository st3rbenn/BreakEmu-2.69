import CharacterController from "../../../breakEmu_API/controller/character.controller"
import Account from "../../../breakEmu_API/model/account.model"
import { ansiColorCodes } from "../../../breakEmu_Core/Colors"
import Logger from "../../../breakEmu_Core/Logger"
import {
	CharacterCreationRequestMessage,
	CharacterCreationResultMessage,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../WorldClient"
import CharacterListHandler from "./CharacterListHandler"

class CharacterCreationHandler {
	private static logger: Logger = new Logger("CharacterCreationHandler")
	private static _characterController = new CharacterController()

	public static async handleCharacterCreationRequestMessage(
		message: CharacterCreationRequestMessage,
		client: WorldClient
	) {
		this._characterController.createCharacter(
			message,
			client.account as Account,
			async (reason) => {
				await client.Send(
					client.serialize(new CharacterCreationResultMessage(1, reason))
				)
			},
			async (character) => {
				this.logger.writeAsync(
					`Character ${character.name} created`,
					ansiColorCodes.bgGreen
				)
				await client.Send(
					client.serialize(new CharacterCreationResultMessage(0, 0))
				)

				client.account?.characters.set(character.id, character)

				await CharacterListHandler.handleCharactersListMessage(client)
			}
		)
	}
}

export default CharacterCreationHandler
