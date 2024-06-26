import Logger from "../../../../../breakEmu_Core/Logger"
import Character from "../../../../../breakEmu_API/model/character.model"
import MapElement from "../MapElement"
import MapStatedElement from "../MapStatedElement"
import IInteractiveElementHandler from "./IInteractiveElementHandler"

class GatherElementHandler implements IInteractiveElementHandler {
	private static logger: Logger = new Logger("GatherElementHandler")
	async handle(element: MapElement, character: Character): Promise<void> {
		try {
			await this.gatherElement(element, character)
		} catch (error) {
			GatherElementHandler.logger.error(error as string)
		}
	}

	private async gatherElement(element: MapElement, character: Character) {
		try {
			if (element instanceof MapStatedElement) {
				await element.use(character)
			}
		} catch (error) {
			GatherElementHandler.logger.error(error as string)
		}
	}
}

export default GatherElementHandler
