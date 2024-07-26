import Character from "../../../breakEmu_API/model/character.model"
import GameMap from "../../../breakEmu_API/model/map.model"
import Logger from "../../../breakEmu_Core/Logger"
import {
  DialogTypeEnum,
  TeleportDestination,
  TeleporterTypeEnum,
  ZaapDestinationsMessage,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../../breakEmu_World/WorldClient"
import DialogHandler from "../../../breakEmu_World/handlers/dialog/DialogHandler"
import MapPoint from "../map/MapPoint"
import MapElement from "../map/element/MapElement"
import Dialog from "./Dialog"

class ZaapDialog extends Dialog {
	logger: Logger = new Logger("ZaapDialog")

	character: Character
	zaap: MapElement | undefined

	constructor(character: Character, zaap?: MapElement) {
		super()
		this.character = character
		this.zaap = zaap
	}

	async open(): Promise<void> {
		try {
      this.character.isZaapDialog = true
			await this.sendZaapList()
		} catch (error) {
			this.logger.error(error as any)
		}
	}
	async close(): Promise<void> {
		try {
			this.character.removeDialog()
      this.character.isZaapDialog = false
			await DialogHandler.leaveDialogMessage(
				this.character.client as WorldClient,
				DialogTypeEnum.DIALOG_TELEPORTER
			)
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	private async sendZaapList() {
		try {
			let teleportDestination: Map<number, TeleportDestination> = new Map()

			for (const [_, zaap] of this.character.knownZaaps) {
				const destination = new TeleportDestination(
					TeleporterTypeEnum.TELEPORTER_ZAAP,
					zaap.id,
					zaap.subareaId,
					0,
					this.zaap ? this.getCostTo(zaap) : 0
				)

				teleportDestination.set(zaap.id, destination)
			}

			await this.character.client?.Send(
				new ZaapDestinationsMessage(
          TeleporterTypeEnum.TELEPORTER_ZAAP,
          Array.from(teleportDestination.values()),
          this.character.spawnMapId ?? 0
        )
			)
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	getCostTo(map: GameMap) {
		let pos = map.zaapCell as MapPoint
		let dest = this.zaap ? this.zaap.record.point : this.character.map?.zaapCell as MapPoint

		return Math.floor(
			Math.sqrt(Math.pow(dest.x - pos.x, 2) + Math.pow(dest.y - pos.y, 2)) * 10
		)
	}
}

export default ZaapDialog
