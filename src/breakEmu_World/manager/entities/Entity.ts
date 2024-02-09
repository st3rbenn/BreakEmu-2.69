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
	private _logger: Logger = new Logger("Entity")
	abstract _id: number
	abstract _name: string
	abstract _cellId: number
	abstract _point: MapPoint
	abstract _map: Map | null
	abstract _direction: DirectionsEnum

	constructor(map: Map | null = null) {
		this.map = map
	}

	abstract getActorInformations(): GameRolePlayActorInformations

	public async sendMap(message: DofusMessage) {
		if (this.map !== null && this.map.instance !== null) {
			await this._logger.writeAsync(
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

	get map(): Map | null {
		return this._map
	}

	set map(value: Map | null) {
		this._map = value
	}
}

export default Entity
