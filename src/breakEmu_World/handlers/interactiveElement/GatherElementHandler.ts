import Character from "@breakEmu_API/model/character.model"
import Logger from "@breakEmu_Core/Logger"
import MapElement from "../../manager/map/element/MapElement"
import MapStatedElement from "../../manager/map/element/MapStatedElement"
import IInteractiveElementHandler from "./IInteractiveElementHandler"

class GatherElementHandler implements IInteractiveElementHandler {
	private static logger: Logger = new Logger("GatherElementHandler")

	async handle(character: Character, element: MapElement): Promise<void> {
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
