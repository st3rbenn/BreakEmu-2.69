import InteractiveElementBonus from "@breakEmu_Core/bull/tasks/BonusTask"
import MapInstance from "@breakEmu_World/manager/map/MapInstance"
import MapPoint from "@breakEmu_World/manager/map/MapPoint"
import MapElement from "@breakEmu_World/manager/map/element/MapElement"
import MapInteractiveElement from "@breakEmu_World/manager/map/element/MapInteractiveElement"
import MapStatedElement from "@breakEmu_World/manager/map/element/MapStatedElement"
import InteractiveSkill from "./InteractiveSkill.model"
import { InteractiveElementData } from "./map.model"

class InteractiveElementModel {
	id: number
	elementId: number
	cellId: number
	mapId: number
	gfxId: number
	bonesId: number
	elementType: number
  harvestable: boolean = true

	skill: InteractiveSkill
 
	ageBonus: number = 0

  bonusTask: InteractiveElementBonus | null = null

	private _point: MapPoint

	public static interactiveCells: Map<
		number,
		InteractiveElementModel
	> = new Map<number, InteractiveElementModel>()

	constructor(
    id: number,
		elementId: number,
		cellId: number,
		mapId: number,
		gfxId: number,
		bonesId: number,
		elementType: number,
	) {
    this.id = id
		this.elementId = elementId
		this.cellId = cellId
		this.mapId = mapId
		this.gfxId = gfxId
		this.bonesId = bonesId
		this.elementType = elementType

		this._point = new MapPoint(cellId)
		this.skill = InteractiveSkill.getByMapIdAndIdentifier(
      mapId,
      elementId
    ) as InteractiveSkill

    if(this.skill === undefined) {
      
    }
	}

	public save(): InteractiveElementData {
		return {
			id: this.id,
			elementId: this.elementId,
			cellId: this.cellId,
			mapId: this.mapId,
			gfxId: this.gfxId,
			bonesId: this.bonesId,
			elementType: this.elementType,
		}
	}

	get point(): MapPoint {
		return this._point
	}

	get stated(): boolean {
		return this.bonesId != -1
	}

	public static getInteractiveCells(): Map<number, InteractiveElementModel> {
		return this.interactiveCells
	}

	public static getInteractiveCell(
		elementId: number
	): InteractiveElementModel | undefined {
		return this.interactiveCells.get(elementId)
	}

	public static getInteractiveCellByElementIdAndMapId(
		elementId: number,
		mapId: number
	): InteractiveElementModel | undefined {
		for (const interactiveCell of this.interactiveCells.values()) {
			if (
				interactiveCell.elementId === elementId &&
				interactiveCell.mapId === mapId
			) {
				return interactiveCell
			}
		}
	}

  public static getInteractiveCellsByMapId(mapId: number): InteractiveElementModel[] {
    const cells: InteractiveElementModel[] = []
    for (const interactiveCell of this.interactiveCells.values()) {
      if (interactiveCell.mapId === mapId) {
        cells.push(interactiveCell)
      }
    }
    return cells
  }

	public static addInteractiveCell(
		id: number,
		interactiveCell: InteractiveElementModel
	) {
		this.interactiveCells.set(id, interactiveCell)
	}

  public static getByElementId(elementId: number): InteractiveElementModel | undefined {
    for (const interactiveCell of this.interactiveCells.values()) {
      if (interactiveCell.elementId === elementId) {
        return interactiveCell
      }
    }
  }

  public static getById(id: number): InteractiveElementModel | undefined {
    return this.interactiveCells.get(id)
  }

	public getMapElement(mapInstance: MapInstance): MapElement {
		if (this.stated) {
			return new MapStatedElement(this, mapInstance)
		} else {
			return new MapInteractiveElement(this, mapInstance)
		}
	}
}

export default InteractiveElementModel
