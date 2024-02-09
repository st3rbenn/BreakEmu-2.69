import {
	DirectionsEnum,
	InteractiveTypeEnum,
	MapScrollEnum,
} from "../../breakEmu_Server/IO"
import MapInstance from "../../breakEmu_World/manager/map/MapInstance"
import MapPoint from "../../breakEmu_World/manager/map/MapPoint"
import Cell from "../../breakEmu_World/manager/map/cell/Cell"
import InteractiveElementModel from "./InteractiveElement.model"
import SubArea from "./SubArea.model"
import MapScrollAction from "./mapScrollAction.model"

class GameMap {
	private _id: number
	private _subareaId: number
	private _version: number

	private _subArea: SubArea

	private _instance: MapInstance

	private _leftMap: number
	private _rightMap: number
	private _topMap: number
	private _bottomMap: number

	private _cells: Map<number, Cell> = new Map<number, Cell>()
	private _elements: Map<number, InteractiveElementModel> = new Map<
		number,
		InteractiveElementModel
	>()

	public static maps: Map<number, GameMap> = new Map<number, GameMap>()

	constructor(
		id: number,
		subareaId: number,
		version: number,
		leftMap: number,
		rightMap: number,
		topMap: number,
		bottomMap: number
	) {
		this._id = id
		this._subareaId = subareaId
		this._version = version
		this._leftMap = leftMap
		this._rightMap = rightMap
		this._topMap = topMap
		this._bottomMap = bottomMap

		this._instance = new MapInstance(this)
	}

	get id(): number {
		return this._id
	}

	get subareaId(): number {
		return this._subareaId
	}

	get version(): number {
		return this._version
	}

	get subArea(): SubArea {
		return this._subArea
	}

	get instance(): MapInstance {
		return this._instance
	}

	get leftMap(): number {
		return this._leftMap
	}

	get rightMap(): number {
		return this._rightMap
	}

	get topMap(): number {
		return this._topMap
	}

	get bottomMap(): number {
		return this._bottomMap
	}

	get cells(): Map<number, Cell> {
		return this._cells
	}

	set cells(value: Map<number, Cell>) {
		this._cells = value
	}

	get elements(): Map<number, InteractiveElementModel> {
		return this._elements
	}

	static getMapById(id: number): GameMap | undefined {
		return GameMap.maps.get(id)
	}

	static getNeighbourMapId(map: GameMap, scrollType: number): number {
		const scrollAction = MapScrollAction.getMapScrollAction(map.id)

		switch (scrollType) {
			case MapScrollEnum.LEFT:
				return scrollAction != null && scrollAction.leftMapId != 0
					? scrollAction.leftMapId
					: map.leftMap
			case MapScrollEnum.RIGHT:
				return scrollAction != null && scrollAction.rightMapId != 0
					? scrollAction.rightMapId
					: map.rightMap
			case MapScrollEnum.TOP:
				return scrollAction != null && scrollAction.topMapId != 0
					? scrollAction.topMapId
					: map.topMap
			case MapScrollEnum.BOTTOM:
				return scrollAction != null && scrollAction.bottomMapId != 0
					? scrollAction.bottomMapId
					: map.bottomMap
		}

		return -1
	}

	static invertSrollType(scrollType: number): number {
		switch (scrollType) {
			case MapScrollEnum.LEFT:
				return MapScrollEnum.RIGHT
			case MapScrollEnum.RIGHT:
				return MapScrollEnum.LEFT
			case MapScrollEnum.TOP:
				return MapScrollEnum.BOTTOM
			case MapScrollEnum.BOTTOM:
				return MapScrollEnum.TOP
			default:
				return MapScrollEnum.UNDEFINED
		}
	}

	static getDirection(scrollType: number): number {
		switch (scrollType) {
			case MapScrollEnum.LEFT:
				return DirectionsEnum.DIRECTION_WEST
			case MapScrollEnum.RIGHT:
				return DirectionsEnum.DIRECTION_EAST
			case MapScrollEnum.TOP:
				return DirectionsEnum.DIRECTION_NORTH
			case MapScrollEnum.BOTTOM:
				return DirectionsEnum.DIRECTION_SOUTH
			default:
				return DirectionsEnum.DIRECTION_EAST
		}
	}

	static findNearMapBorder(
		map: GameMap,
		scrollType: number,
		cellPoint: MapPoint
	): number {
		const invertScrollType = this.invertSrollType(scrollType)
		const cells = map.getMapChangeCells(scrollType)

		if (cells.length === 0) {
			return map.randomWalkableCell().id
		}

		return cells.find((cellId) => {
			const neighbourCellId = GameMap.getNeighbourCellId(
				cellId,
				invertScrollType
			)
			if (neighbourCellId) {
				const neighbourCell = map.cells.get(neighbourCellId)
				if (neighbourCell) {
					return neighbourCell.isWalkable()
				}
			}
			return false
		}) as number
	}

	public randomWalkableCell(): Cell {
		return this.cells.get(
			Array.from(this.cells.keys()).find((cellId) => {
				return this.cells.get(cellId)?.isWalkable() as boolean
			}) as number
		) as Cell
	}

	public getMapChangeCells(scrollType: number): number[] {
		let result: number[] = []

		switch (scrollType) {
			case MapScrollEnum.LEFT:
				for (let i = 0; i < 20; i++) {
					result.push(i * 14)
				}
				break
			case MapScrollEnum.RIGHT:
				for (let i = 0; i < 20; i++) {
					result.push(i * 14 + 13)
				}
				break
			case MapScrollEnum.TOP:
				for (let i = 0; i < 14; i++) {
					result.push(i)
				}
				break
			case MapScrollEnum.BOTTOM:
				for (let i = 0; i < 14; i++) {
					result.push(i + 532)
				}
				break
		}

		return result
	}

	public isCellWalkable(cellId: number): boolean {
		if (cellId < 0 || cellId > 559) return false
		const cell = this.cells.get(cellId)
		if (cell) {
			return cell.isWalkable()
		}
		return false
	}

	public getNearestCellId(interactiveType: InteractiveTypeEnum): number {
		let element:
			| InteractiveElementModel
			| undefined = this.getFirstElementByType(interactiveType)
		if (element) {
			console.log("element.cellId", element.cellId)
			return element.cellId
		}

		return this.randomWalkableCell().id
	}

	public findNearMapBorder() {}

	public getFirstElementByType(
		interactiveType: InteractiveTypeEnum
	): InteractiveElementModel | undefined {
		let element: InteractiveElementModel | undefined = undefined
		this.elements.forEach((el) => {
			if (el.skill.type === interactiveType) {
				element = el
			}
		})
		return element
	}

	static getNeighbourCellId(
		cellId: number,
		scrollType: number
	): number | undefined {
		let result: number = 0
		switch (scrollType) {
			case MapScrollEnum.TOP:
				result = cellId + 532
				break
			case MapScrollEnum.LEFT:
				result = cellId + 27
				break
			case MapScrollEnum.RIGHT:
				result = cellId - 27
				break
			case MapScrollEnum.BOTTOM:
				result = cellId - 532
				break
			default:
				result = 0
		}

		return result
	}

	public save(): MapData {
		return {
			id: this.id,
			subareaId: this.subareaId,
			version: this.version,
			leftMap: this.leftMap,
			rightMap: this.rightMap,
			topMap: this.topMap,
			bottomMap: this.bottomMap,
			cells: this.saveCells(),
			elements: this.saveElements(),
		}
	}

	public saveCells(): string {
		let cells: CellData[] = []
		this.cells.forEach((cell) => {
			cells.push(cell.save())
		})
		return JSON.stringify(cells)
	}

	public saveElements(): string {
		let elements: InteractiveElementData[] = []
		this.elements.forEach((element) => {
			elements.push(element.save())
		})
		return JSON.stringify(elements)
	}
}

export interface CellData {
	id: number
	blue: boolean
	red: boolean
	losMov: number
	mapChangeData: number
}

export interface InteractiveElementData {
	elementId: number
	cellId: number
	mapId: number
	gfxId: number
	bonesId: number
}

export interface MapData {
	id: number
	subareaId: number
	version: number
	leftMap: number
	rightMap: number
	topMap: number
	bottomMap: number
	cells: string
	elements: string
}

export default GameMap
