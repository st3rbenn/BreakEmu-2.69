import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import {
	PlayerStatusEnum,
	PlayerStatusUpdateMessage,
	PlayerStatusUpdateRequestMessage,
} from "@breakEmu_Protocol/IO"
import WorldClient from "../../../WorldClient"

class PlayerStatusHandler {
	private static logger: Logger = new Logger("PlayerStatusHandler")

	public static async handlePlayerStatusMessage(
		client: WorldClient,
		message: PlayerStatusUpdateRequestMessage
	) {
		const messagePlayerStatus =
			PlayerStatusEnum[message?.status?.statusId as number]
		this.logger.write(
			`PlayerStatusHandler: ${messagePlayerStatus}`,
			ansiColorCodes.bgMagenta
		)

		await client.Send(
			new PlayerStatusUpdateMessage(
				client.account.id,
				client.selectedCharacter.id,
				message.status
			)
		)

		client.selectedCharacter.status = message?.status
			?.statusId as PlayerStatusEnum
	}
}

export default PlayerStatusHandler
