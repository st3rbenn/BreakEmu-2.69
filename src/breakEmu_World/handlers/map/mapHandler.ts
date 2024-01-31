import Logger from "../../../breakEmu_Core/Logger"
import {
    BasicNoOperationMessage,
    BasicTimeMessage,
    FightStartingPositions,
    GameRolePlayActorInformations,
    MapComplementaryInformationsDataMessage,
    MapFightCountMessage,
    MapInformationsRequestMessage,
} from "../../../breakEmu_Server/IO"
import WorldServer from "../../../breakEmu_World/WorldServer"
import WorldClient from "../../WorldClient"
import GameMap from "../../../breakEmu_API/model/map.model";

class MapHandler {
    private static logger: Logger = new Logger("MapHandler")

    public static async handleMapInformationsRequestMessage(
        client: WorldClient,
        message: MapInformationsRequestMessage
    ) {
        if (client.selectedCharacter && client.selectedCharacter?.mapId === message.mapId) {
            /*let currentCharacterGameRoleInfo: GameRolePlayActorInformations[] = []
            WorldServer.getInstance().clients.forEach((client) => {
                currentCharacterGameRoleInfo.push(
                    client.selectedCharacter?.getActorInformations() as GameRolePlayActorInformations
                )
            })*/

            /*await client.Send(
                client.serialize(
                    new MapComplementaryInformationsDataMessage(
                        0,
                        client?.selectedCharacter?.mapId,
                        [],
                        currentCharacterGameRoleInfo,
                        [],
                        [],
                        [],
                        [],
                        false,
                        new FightStartingPositions([], [])
                    )
                )
            )*/

            const map = GameMap.getMapById(message.mapId as number) as GameMap

            this.logger.write("CURRENT REQUESTED MAP: " + map.id)

            /*if(client.selectedCharacter.map !== null) {}*/

            await client.Send(client.serialize(new MapFightCountMessage(0)))

            await client.Send(client.serialize(new BasicNoOperationMessage()))

            const date = new Date()
            const unixTime = Math.round(date.getTime() / 1000)
            await client.Send(client.serialize(new BasicTimeMessage(unixTime, 1)))
        }
    }
}

export default MapHandler
