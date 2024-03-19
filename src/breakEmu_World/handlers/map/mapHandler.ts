import GameMap from "../../../breakEmu_API/model/map.model"
import { ansiColorCodes } from "../../../breakEmu_Core/Colors"
import Logger from "../../../breakEmu_Core/Logger"
import {
	BasicNoOperationMessage,
	ChangeMapMessage,
	GameMapMovementCancelMessage,
	GameMapMovementRequestMessage,
	MapInformationsRequestMessage,
	MapScrollEnum,
} from "../../../breakEmu_Server/IO"
import MapPoint from "../../../breakEmu_World/manager/map/MapPoint"
import WorldClient from "../../WorldClient"

class MapHandler {
	private static logger: Logger = new Logger("MapHandler")

	public static async handleMapInformationsRequestMessage(
		client: WorldClient,
		message: MapInformationsRequestMessage
	) {
		try {
			if (client.selectedCharacter?.mapId == message.mapId) {
				const selectedMap = GameMap.getMapById(
					message.mapId as number
				) as GameMap
				client.selectedCharacter.map = selectedMap

				if (client.selectedCharacter.map === null) {
					this.logger.error(`Map ${message.mapId} not found`)
					return
				}

				await client.selectedCharacter?.onEnterMap()
				await client.selectedCharacter?.noMove()
			}
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	public static async handleGameMapMovementRequestMessage(
		message: GameMapMovementRequestMessage,
		client: WorldClient
	): Promise<void> {
		try {
			if (
				!client.selectedCharacter?.changeMap &&
				client.selectedCharacter?.map?.id === message.mapId
			) {
				await client.selectedCharacter?.move(message.keyMovements as number[])
			} else {
				await client.selectedCharacter?.noMove()
			}
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	public static async handleMapMovementConfirmMessage(
		client: WorldClient
	): Promise<void> {
		try {
			if (client.selectedCharacter?.isMoving) {
				await client.selectedCharacter.stopMove()
				await client?.Send(new BasicNoOperationMessage())
			}
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	public static async handleMapMovementCancelMessage(
		message: GameMapMovementCancelMessage,
		client: WorldClient
	) {
		try {
			await client.selectedCharacter?.cancelMove(message.cellId as number)
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	public static async handleChangeMapMessage(
		message: ChangeMapMessage,
		client: WorldClient
	) {
		try {
			let scrollType = MapScrollEnum.UNDEFINED

			if (client.selectedCharacter?.map?.leftMap === message.mapId) {
				scrollType = MapScrollEnum.LEFT
			} else if (client.selectedCharacter?.map?.rightMap === message.mapId) {
				scrollType = MapScrollEnum.RIGHT
			} else if (client.selectedCharacter?.map?.topMap === message.mapId) {
				scrollType = MapScrollEnum.TOP
			} else if (client.selectedCharacter?.map?.bottomMap === message.mapId) {
				scrollType = MapScrollEnum.BOTTOM
			}

			if (scrollType != MapScrollEnum.UNDEFINED) {
				const teleportMapId: number = GameMap.getNeighbourMapId(
					client.selectedCharacter.map as GameMap,
					scrollType
				)

				const neighbourCellId = GameMap.getNeighbourCellId(
					client?.selectedCharacter?.cellId,
					scrollType
				)

				const cellPoint = new MapPoint(neighbourCellId)

				client.selectedCharacter.direction = GameMap.getDirection(scrollType)

				const teleportedMap = GameMap.getMapById(teleportMapId)

				if (teleportedMap !== undefined) {
					if (
						teleportedMap.isCellWalkable(cellPoint.cellId) &&
						cellPoint.isInMap()
					) {
						await client.selectedCharacter.teleport(
							teleportMapId,
							cellPoint.cellId
						)
					} else {
						await this.logger.writeAsync(
							`Cell ${cellPoint.cellId} is not walkable`,
							ansiColorCodes.bgRed
						)

						const adjacentCell = GameMap.findNearMapBorder(
							teleportedMap,
							scrollType,
							cellPoint
						)

						await client.selectedCharacter.teleport(teleportMapId, adjacentCell)

						// await client.selectedCharacter.noMove()
						// await client.Send(client.serialize(new BasicNoOperationMessage()))
					}
				}
			}
		} catch (error) {
			this.logger.error(error as any)
		}
	}
}

export default MapHandler
