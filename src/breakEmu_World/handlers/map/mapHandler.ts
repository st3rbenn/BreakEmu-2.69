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
	public static handleMapInformationsRequestMessage(
		client: WorldClient,
		message: MapInformationsRequestMessage
	) {
		const currentCharacterGameRoleInfo = client?.selectedCharacter?.toGameRolePlayActorInformations() as GameRolePlayActorInformations

    console.log('MAP ID', currentCharacterGameRoleInfo.look?.indexedColors)

		client.Send(
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

		client.Send(client.serialize(new MapFightCountMessage(0)))

		client.Send(client.serialize(new BasicNoOperationMessage()))
		//DateTime.Now.GetUnixTimeStampDouble()
		const date = new Date()
		const unixTime = Math.round(date.getTime() / 1000)
		client.Send(client.serialize(new BasicTimeMessage(unixTime, 1)))
	}
}

export default MapHandler
