import Character from "@breakEmu_API/model/character.model"
import Logger from "@breakEmu_Core/Logger"
import MapElement from "../../manager/map/element/MapElement"
import IInteractiveElementHandler from "./IInteractiveElementHandler"
import CraftExchange from "../../manager/dialog/job/CraftExchange"
import Skill from "breakEmu_API/model/skill.model"

class CraftHandler implements IInteractiveElementHandler {
	private logger: Logger = new Logger("CraftHandler")

	async handle(character: Character, element: MapElement): Promise<void> {
		try {
			this.logger.info("CraftHandler")
			this.logger.info(`Character: ${character.name}`)
			const skill = element.record.skill.record

			if (skill) {
				await character.setDialog(new CraftExchange(character, skill))
			}
		} catch (error) {
			this.logger.error(error as string)
		}
	}
}

export default CraftHandler
