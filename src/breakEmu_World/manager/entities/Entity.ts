import MapPoint from "../map/MapPoint"
import Map from "../../../breakEmu_API/model/map.model"
import {
	DirectionsEnum,
	DofusMessage,
	GameRolePlayActorInformations,
	GameRolePlayShowActorMessage,
} from "../../../breakEmu_Server/IO"
import { ansiColorCodes } from "../../../breakEmu_Core/Colors"
import Logger from "../../../breakEmu_Core/Logger"

abstract class Entity {
	private logger: Logger = new Logger("Entity")
	abstract id: number
	abstract name: string
	abstract cellId: number
	abstract point: MapPoint
	map: Map | null
	abstract direction: DirectionsEnum

	constructor(map: Map | null = null) {
		this.map = map
	}

	abstract getActorInformations(): GameRolePlayActorInformations

	public async sendMap(message: DofusMessage) {
		if (this.map !== null && this.map.instance !== null) {
			await this.logger.writeAsync(
				`Sending message to map ${this.map.id}...`,
				ansiColorCodes.green
			)
			await this.map.instance.send(message)
		}
	}

	public async refreshActorOnMap() {
		await this.sendMap(
			new GameRolePlayShowActorMessage(this.getActorInformations())
		)
	}
}

export default Entity
