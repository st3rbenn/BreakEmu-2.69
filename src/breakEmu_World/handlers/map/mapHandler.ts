import {
  BasicNoOperationMessage,
  BasicTimeMessage,
  FightStartingPositions,
  GameRolePlayActorInformations,
  MapComplementaryInformationsDataMessage,
  MapFightCountMessage,
  MapInformationsRequestMessage,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../WorldClient"

class MapHandler {
	public static async handleMapInformationsRequestMessage(
		client: WorldClient,
		message: MapInformationsRequestMessage
	) {
		const currentCharacterGameRoleInfo = client?.selectedCharacter?.toGameRolePlayActorInformations() as GameRolePlayActorInformations

		await client.Send(
			client.serialize(
				new MapComplementaryInformationsDataMessage(
					0,
					client?.selectedCharacter?.mapId,
					[],
					[currentCharacterGameRoleInfo],
					[],
					[],
					[],
					[],
					false,
					new FightStartingPositions([], [])
				)
			)
		)

		await client.Send(client.serialize(new MapFightCountMessage(0)))

		await client.Send(client.serialize(new BasicNoOperationMessage()))

		const date = new Date()
		const unixTime = Math.round(date.getTime() / 1000)
		await client.Send(client.serialize(new BasicTimeMessage(unixTime, 1)))
	}
}

export default MapHandler
