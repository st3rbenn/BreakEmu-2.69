import WorldClient from "./../../../../breakEmu_World/WorldClient"
import { InteractiveUseRequestMessage, ZaapRespawnUpdatedMessage } from "./../../../../breakEmu_Server/IO/network/protocol"
import Logger from "../../../../breakEmu_Core/Logger"
class InteractiveMapHandler {
	private static logger: Logger = new Logger("InteractiveMapHandler")
	public static async handleInteractiveUse(
		message: InteractiveUseRequestMessage,
		client: WorldClient
	) {
		try {
			await client.selectedCharacter?.map?.instance?.useInteractiveElement(
				client.selectedCharacter,
				message.elemId as number,
				message.skillInstanceUid as number
			)
		} catch (e) {
			this.logger.error(`${(e as any).message} - ${(e as any).stack}`)
		}
	}

  public static async handleSetSpawnPoint(client: WorldClient, mapId: number) {
    await client.Send(new ZaapRespawnUpdatedMessage(mapId))
  }
}

export default InteractiveMapHandler
