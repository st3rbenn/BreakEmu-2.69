import Npc from "@breakEmu_API/model/npc.model"
import Logger from "@breakEmu_Core/Logger"
import { NpcActionEnum, NpcGenericActionRequestMessage } from "@breakEmu_Protocol/IO"
import AuctionHouseDialog from "@breakEmu_World/manager/dialog/auctionHouse/AuctionHouseDialog"
import WorldClient from "@breakEmu_World/WorldClient"

class NpcHandler {
	static logger: Logger = new Logger("NpcHandler")

	static async handleNpcGenericActionRequestMessage(
		client: WorldClient,
		message: NpcGenericActionRequestMessage
	) {
		if (message.npcMapId === client.selectedCharacter.mapId) {
			this.logger.write(
				`NpcGenericActionRequestMessage: actionId -> ${message.npcActionId} npcId -> ${message.npcId} npcMapId -> ${message.npcMapId}`
			)

      if(client.selectedCharacter.dialog) {
        await client.selectedCharacter.dialog.onNpcAction(client.selectedCharacter, message.npcActionId as NpcActionEnum)
      }

			const npc = client.selectedCharacter.map
				.instance()
				.getEntities<Npc>(Npc)
				.find((entity) => entity.id === message.npcId)


      if(npc) {
        this.logger.write(`Npc found: ${npc.name}`)

        await npc.interact(client.selectedCharacter, message.npcActionId as NpcActionEnum)
      }


		} else {
			this.logger.error(
				`Npc is not on the same map as the player. NpcMapId: ${message.npcMapId} PlayerMapId: ${client.selectedCharacter.mapId}`
			)
		}
	}
}

export default NpcHandler
