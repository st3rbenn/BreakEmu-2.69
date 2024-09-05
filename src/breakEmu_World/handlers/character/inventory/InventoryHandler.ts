import CharacterItemController from "@breakEmu_API/controller/characterItem.controller"
import Logger from "@breakEmu_Core/Logger"
import { ObjectSetPositionMessage } from "@breakEmu_Protocol/IO"
import WorldClient from "../../../WorldClient"
import Container from "@breakEmu_Core/container/Container"

class InventoryHandler {
	private static logger: Logger = new Logger("InventoryHandler")
	private static container: Container = Container.getInstance()

	public static async handleObjectSetPositionMessage(
		client: WorldClient,
		message: ObjectSetPositionMessage
	): Promise<void> {
		console.log("handleObjectSetPositionMessage")
		console.log("objectUID", message.objectUID)
		const item = await client.selectedCharacter.inventory.getItem(
			message.objectUID as number
		)
		if (item) {
			this.logger.write(
				`handleObjectSetPositionMessage: ${message.objectUID} ${message.position} ${message.quantity}`
			)
			await client.selectedCharacter?.inventory?.setItemPosition(
				item,
				message.position as number,
				message.quantity as number
			)
		}
	}
}

export default InventoryHandler
