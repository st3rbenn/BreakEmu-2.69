import Logger from "@breakEmu_Core/Logger"
import {
	DialogTypeEnum,
	LeaveDialogMessage,
	LeaveDialogRequestMessage,
} from "@breakEmu_Protocol/IO"
import WorldClient from "../../WorldClient"

class DialogHandler {
	private static logger: Logger = new Logger("DialogHandler")

	static async leaveDialogMessage(
		client: WorldClient,
		dialogType: DialogTypeEnum
	): Promise<void> {
		try {
      this.logger.warn(`Leaving dialog ${dialogType}`)
			await client.Send(new LeaveDialogMessage(dialogType))
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	static async handleLeaveDialogRequestMessage(
		client: WorldClient,
		message: LeaveDialogRequestMessage
	) {
		try {
			await client.selectedCharacter?.leaveDialog()
		} catch (error) {
			this.logger.error(error as any)
		}
	}
}

export default DialogHandler
