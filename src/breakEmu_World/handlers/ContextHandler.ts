import {
	EntityDispositionInformations,
	GameContextEnum,
	GameRolePlayActorInformations,
	GameRolePlayShowActorMessage,
} from "../../breakEmu_Server/IO"
import Character from "../../breakEmu_API/model/character.model"
import WorldClient from "../WorldClient"
class ContextHandler {
	public static async handleGameContextCreateMessage(
		client: WorldClient,
		character: Character
	) {
		let inFight: boolean = false

		if (inFight) {
			client.selectedCharacter?.destroyContext(client)
			client.selectedCharacter?.createContext(client, GameContextEnum.FIGHT)
		} else {
			client.selectedCharacter?.createContext(client, GameContextEnum.ROLE_PLAY)

			const entityDisposition = new EntityDispositionInformations(
				client.selectedCharacter?.cellId as number,
				client.selectedCharacter?.direction as number
			)
			const gameRolePlayShowActorMessage = new GameRolePlayActorInformations(
				client?.selectedCharacter?.id,
				entityDisposition,
				client?.selectedCharacter?.look.toEntityLook()
			)

			client.Send(client.serialize(new GameRolePlayShowActorMessage(gameRolePlayShowActorMessage)))

			client.selectedCharacter?.teleport(
				client,
				client.selectedCharacter?.mapId as number,
				client.selectedCharacter?.cellId as number
			)
      client.selectedCharacter?.refreshStats(client)
		}
	}
}

export default ContextHandler
