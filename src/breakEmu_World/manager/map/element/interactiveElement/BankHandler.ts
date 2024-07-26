import Character from "../../../../../breakEmu_API/model/character.model"
import Logger from "../../../../../breakEmu_Core/Logger"
import BankExchange from "../../../exchange/BankExchange"
import IInteractiveElementHandler from "./IInteractiveElementHandler"

class BankHandler implements IInteractiveElementHandler {
	private static logger: Logger = new Logger("BankHandler")
	async handle(character: Character): Promise<void> {
		try {
			await character.setDialog(new BankExchange(character, character.bank.items))
		} catch (error) {
			BankHandler.logger.error(error as string)
		}
	}
}

export default BankHandler
