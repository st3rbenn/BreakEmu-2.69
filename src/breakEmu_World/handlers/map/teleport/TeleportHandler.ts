import GameMap from "../../../../breakEmu_API/model/map.model"
import { ansiColorCodes } from "../../../../breakEmu_Core/Colors"
import Logger from "../../../../breakEmu_Core/Logger"
import {
	TeleportRequestMessage,
	ZaapRespawnSaveRequestMessage,
	ZaapRespawnUpdatedMessage,
} from "../../../../breakEmu_Server/IO"
import WorldClient from "../../../WorldClient"

class TeleportHandler {
	private static logger: Logger = new Logger("TeleportHandler")

	public static async handleTeleportRequestMessage(
		client: WorldClient,
		message: TeleportRequestMessage
	) {
		console.log(
			"TeleportHandler: handleTeleportRequestMessage",
			client?.selectedCharacter?.isZaapDialog
		)
		if (client?.selectedCharacter?.isZaapDialog) {
			console.log("TeleportHandler: isZaapDialog")
			this.logger.write(
				`TeleportHandler: ${client?.account?.pseudo} is using a zaap`,
				ansiColorCodes.bgYellow
			)
			const map = GameMap.getMapById(message.mapId as number)

			if (map) {
				await client?.selectedCharacter?.teleport(
					message.mapId as number,
					map.zaapCell?.cellId
				)
			}
		}
	}

	public static async handleZaapRespawnSaveRequestMessage(
		client: WorldClient,
		message: ZaapRespawnSaveRequestMessage
	) {
		if (!client.selectedCharacter?.map?.hasZaap) return

		client.selectedCharacter?.setSpawnPoint()
	}

	public static async handleSetSpawnPoint(client: WorldClient, mapId: number) {
		await client.Send(new ZaapRespawnUpdatedMessage(mapId))
	}
}

export default TeleportHandler
