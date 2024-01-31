import Logger from "../../../../breakEmu_Core/Logger"
import { ObjectSetPositionMessage } from "../../../../breakEmu_Server/IO"
import WorldClient from "../../../WorldClient"

class InventoryHandler {
	private static logger: Logger = new Logger("InventoryHandler")

	public static async handleObjectSetPositionMessage(
		client: WorldClient,
		message: ObjectSetPositionMessage
	): Promise<void> {
    const item = await client.selectedCharacter?.inventory?.getItem(message.objectUID as number)
    if(item) {
      this.logger.write(`handleObjectSetPositionMessage: ${message.objectUID} ${message.position} ${message.quantity}`)
      await client.selectedCharacter?.inventory?.setItemPosition(item, message.position as number, message.quantity as number)
    }
	}
}

export default InventoryHandler
