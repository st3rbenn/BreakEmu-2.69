import Logger from "@breakEmu_Core/Logger"
import { InteractiveUseRequestMessage } from "@breakEmu_Protocol/IO/network/protocol"
import WorldClient from "@breakEmu_World/WorldClient"
class InteractiveMapHandler {
	private static logger: Logger = new Logger("InteractiveMapHandler")
	public static async handleInteractiveUse(
		message: InteractiveUseRequestMessage,
		client: WorldClient
	) {
		try {
			await client.selectedCharacter.map
				.instance()
				.useInteractiveElement(
					client.selectedCharacter,
					message.elemId as number,
					message.skillInstanceUid as number
				)
		} catch (e) {
			this.logger.error(`${(e as any).message} - ${(e as any).stack}`)
		}
	}
}

export default InteractiveMapHandler
