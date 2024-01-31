import Logger from "../../../breakEmu_Core/Logger"
import WorldClient from "../../../breakEmu_World/WorldClient"

class AchievementHandler {
  private static logger: Logger = new Logger("AchievementHandler")

  public static async handleAchievementAlmostFinishedDetailedListRequestMessage(
    client: WorldClient,
  ) {
    this.logger.write(`AchievementAlmostFinishedDetailedListRequestMessage`)
  }
}

export default AchievementHandler