import Character from "../../../../../breakEmu_API/model/character.model"
import ZaapDialog from "../../../../../breakEmu_World/manager/dialog/ZaapDialog"
import MapElement from "../MapElement"
import Logger from "../../../../../breakEmu_Core/Logger"
import IInteractiveElementHandler from "./IInteractiveElementHandler"

class ZaapHandler implements IInteractiveElementHandler {
	private static logger: Logger = new Logger("ZaapHandler")
	async handle(element: MapElement, character: Character): Promise<void> {
		try {
      await character.setDialog(new ZaapDialog(character, element))
		} catch (error) {
			ZaapHandler.logger.error(error as string)
		}
	}
}

export default ZaapHandler
