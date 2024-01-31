import Logger from "../../../../breakEmu_Core/Logger"
import WorldClient from "../../../WorldClient"
import { PlayerStatusUpdateMessage, PlayerStatusUpdateRequestMessage, PlayerStatusEnum } from "../../../../breakEmu_Server/IO"
import { ansiColorCodes } from "../../../../breakEmu_Core/Colors"

class PlayerStatusHandler {
  private static logger: Logger = new Logger("PlayerStatusHandler")

  public static async handlePlayerStatusMessage(
    client: WorldClient,
    message: PlayerStatusUpdateRequestMessage
  ) {
    this.logger.write(`PlayerStatusHandler: ${client?.account?.pseudo}`, ansiColorCodes.bgMagenta)

    const messagePlayerStatus = PlayerStatusEnum[message?.status?.statusId as number]

    this.logger.write(`PlayerStatusHandler: ${messagePlayerStatus}`, ansiColorCodes.bgMagenta)
  }
}

export default PlayerStatusHandler
