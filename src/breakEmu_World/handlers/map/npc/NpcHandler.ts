import Npc from "@breakEmu_API/model/npc.model"
import Logger from "@breakEmu_Core/Logger"
import { NpcActionEnum, NpcGenericActionRequestMessage } from "@breakEmu_Protocol/IO"
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
