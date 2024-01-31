import { ansiColorCodes } from "../../../../breakEmu_Core/Colors"
import Logger from "../../../../breakEmu_Core/Logger"
import { FinishMoveSetRequestMessage } from "../../../../breakEmu_Server/IO"
import WorldClient from "../../../../breakEmu_World/WorldClient"

class FinishmoveHandler {
	private static logger: Logger = new Logger("FinishmoveHandler")

	public static async handleFinishMoveSetRequestMessage(
		client: WorldClient,
		message: FinishMoveSetRequestMessage
	) {
		try {
			const { finishMoveId, finishMoveState } = message

			this.logger.write(
				`FinishmoveHandler: ${client?.account?.pseudo}`,
				ansiColorCodes.bgMagenta
			)

			const finishMove = client?.selectedCharacter?.finishMoves.get(
				finishMoveId as number
			)

			if (finishMove) {
				finishMove.finishMoveState = finishMoveState as boolean
			}
		} catch (error) {
			this.logger.error(
				`Error while handling FinishMoveSetRequestMessage: ${
					(error as any).message
				}`
			)
		}
	}
}

export default FinishmoveHandler
