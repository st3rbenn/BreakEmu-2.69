import Character from "@breakEmu_API/model/character.model"
import Logger from "@breakEmu_Core/Logger"
import BankExchange from "../../../exchange/BankExchange"
import IInteractiveElementHandler from "./IInteractiveElementHandler"

class BankHandler implements IInteractiveElementHandler {
	private logger: Logger = new Logger("BankHandler")

	async handle(character: Character): Promise<void> {
		try {
			await character.setDialog(new BankExchange(character, character.bank))
		} catch (error) {
			this.logger.error("Error while handling bank interaction: ", error as any)
		}
	}
}

export default BankHandler
