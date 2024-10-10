import MapPoint from "../map/MapPoint"
import GameMap from "@breakEmu_API/model/map.model"
import {
	DirectionsEnum,
	DofusMessage,
	GameContextActorInformations,
	GameRolePlayActorInformations,
	GameRolePlayShowActorMessage,
	messages,
} from "@breakEmu_Protocol/IO"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"

abstract class Entity {
	private logger: Logger = new Logger("Entity")
	abstract id: number
	abstract name: string
	abstract cellId: number
	abstract point: MapPoint
	map: GameMap
	abstract direction: DirectionsEnum

	constructor(map: GameMap | number) {
		if (map instanceof GameMap) {
			this.map = map
		} else {
			const gm = GameMap.getMapById(map)
			if (gm === undefined) {
				throw new Error(`Map ${map} not found`)
			}
			this.map = gm
		}
	}

	abstract getActorInformations(): GameContextActorInformations

	public async sendMap(message: DofusMessage) {
		if (this.map !== null && this.map.instance !== null) {
			try {
				await this.logger.writeAsync(
					`Sending ${messages[message.id].name} to map ${this.map.id}...`,
					ansiColorCodes.green
				)
				await this.map.instance().send(message)
			} catch (e) {
				this.logger.error(`${(e as any).message}}`, e as any)
			}
		}
	}

	public async refreshActorOnMap() {
		try {
			await this.map
				.instance()
				.send(new GameRolePlayShowActorMessage(this.getActorInformations()))
		} catch (e) {
			this.logger.error(`${(e as any).message}`, e as any)
		}
	}
}

export default Entity
