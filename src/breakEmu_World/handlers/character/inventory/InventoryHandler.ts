import CharacterItemController from "@breakEmu_API/controller/characterItem.controller"
import Logger from "@breakEmu_Core/Logger"
import { ObjectSetPositionMessage } from "@breakEmu_Protocol/IO"
import WorldClient from "../../../WorldClient"

class InventoryHandler {
	private static logger: Logger = new Logger("InventoryHandler")

	public static async handleObjectSetPositionMessage(
		client: WorldClient,
		message: ObjectSetPositionMessage
	): Promise<void> {
    const itemUid = await CharacterItemController.getInstance().getUuidFromIntId(message.objectUID as number)
    const item = await client.selectedCharacter.inventory.getItem(itemUid as string)
    if(item) {
      this.logger.write(`handleObjectSetPositionMessage: ${message.objectUID} ${message.position} ${message.quantity}`)
      await client.selectedCharacter?.inventory?.setItemPosition(item, message.position as number, message.quantity as number)
    }
	}
}

export default InventoryHandler
