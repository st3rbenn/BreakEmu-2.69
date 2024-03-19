import Character from "../../../../breakEmu_API/model/character.model"
import { ansiColorCodes } from "../../../../breakEmu_Core/Colors"
import Logger from "../../../../breakEmu_Core/Logger"
import {
	FinishMoveInformations,
	FinishMoveListMessage,
	FinishMoveListRequestMessage,
	FinishMoveSetRequestMessage,
} from "../../../../breakEmu_Server/IO"
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

			const finishMove = client?.selectedCharacter?.finishmoves.get(
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

	public static async handleFinishMoveListRequestMessage(
		client: WorldClient,
		message: FinishMoveListRequestMessage
	) {
		try {
			let finishMoves: FinishMoveInformations[] = []

			client?.selectedCharacter.finishmoves.forEach((fm) => {
				finishMoves.push(fm.toFinishMoveInformations())
			})

			client.Send(new FinishMoveListMessage(finishMoves))
		} catch (error) {
			this.logger.error(
				`Error while handling FinishMoveListRequestMessage: ${
					(error as any).message
				}`
			)
		}
	}
}

export default FinishmoveHandler
