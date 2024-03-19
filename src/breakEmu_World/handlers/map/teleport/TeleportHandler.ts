import DialogHandler from "breakEmu_World/handlers/dialog/DialogHandler"
import GameMap from "../../../../breakEmu_API/model/map.model"
import { ansiColorCodes } from "../../../../breakEmu_Core/Colors"
import Logger from "../../../../breakEmu_Core/Logger"
import { TeleportRequestMessage, ZaapRespawnSaveRequestMessage } from "../../../../breakEmu_Server/IO"
import WorldClient from "../../../WorldClient"

class TeleportHandler {
	private static logger: Logger = new Logger("TeleportHandler")

	public static async handleTeleportRequestMessage(
    client: WorldClient,
		message: TeleportRequestMessage
	) {
    if(client?.selectedCharacter?.isZaapDialog) {
      this.logger.write(`TeleportHandler: ${client?.account?.pseudo} is using a zaap`, ansiColorCodes.bgYellow)
      const map = GameMap.getMapById(message.mapId as number)

      if(map) {
        await client?.selectedCharacter?.teleport(message.mapId as number, map.zaapCell?.cellId)
      }
    }
  }

  public static async handleZaapRespawnSaveRequestMessage(
    client: WorldClient,
    message: ZaapRespawnSaveRequestMessage
  ) {
    if(!client.selectedCharacter?.map?.hasZaap) return

    client.selectedCharacter?.setSpawnPoint()
  }
}

export default TeleportHandler
