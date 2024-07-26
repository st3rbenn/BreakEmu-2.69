import Character from "../../../breakEmu_API/model/character.model"
import Logger from "../../../breakEmu_Core/Logger"
import Dialog from "./Dialog"

class NpcDialog extends Dialog {
	logger: Logger = new Logger("NpcDialog")

	character: Character

	constructor(character: Character) {
		super()
		this.character = character
	}

	async open(): Promise<void> {
		try {
		} catch (error) {
			this.logger.error(error as any)
		}
	}
	async close(): Promise<void> {
		try {
		} catch (error) {
			this.logger.error(error as any)
		}
	}
}

export default NpcDialog
