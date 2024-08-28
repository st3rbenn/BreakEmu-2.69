// import { DirectionsEnum } from "@breakEmu_Server/IO"
// import Point from "./Point"

// class MapPoint {
// 	public static readonly MapWidth: number = 14
// 	public static readonly MapHeight: number = 20
// 	public static readonly MapSize: number = 560
// 	private static readonly VectorRight: Point = new Point(1, 1)
// 	private static readonly VectorDownRight: Point = new Point(1, 0)
// 	private static readonly VectorDown: Point = new Point(1, -1)
// 	private static readonly VectorDownLeft: Point = new Point(0, -1)
// 	private static readonly VectorLeft: Point = new Point(-1, -1)
// 	private static readonly VectorUpLeft: Point = new Point(-1, 0)
// 	private static readonly VectorUp: Point = new Point(-1, 1)
// 	private static readonly VectorUpRight: Point = new Point(0, 1)
// 	private static m_initialized: boolean = false
// 	private static readonly OrthogonalGridReference: MapPoint[] = new Array(
// 		MapPoint.MapSize
// 	)

// 	private m_cellId: number
// 	private m_x: number
// 	private m_y: number

// 	constructor(cellId?: number, x?: number, y?: number, point?: Point) {
// 		if (cellId) {
// 			this.m_cellId = cellId
// 			this.fromCellId()
// 		} else if (point) {
// 			this.m_x = point.x
// 			this.m_y = point.y
// 			this.fromCoords()
// 		} else if (x && y) {
// 			this.m_x = x
// 			this.m_y = y
// 			this.fromCoords()
// 		}
// 	}

// 	private fromCellId() {
// 		if (!MapPoint.m_initialized) {
// 			MapPoint.InitializeStaticGrid()
// 		}
// 		if (this.m_cellId < 0 || this.m_cellId > 560) {
// 			throw new Error("Cell identifier out of bounds (" + this.m_cellId + ").")
// 		}
// 		let mapPoint = MapPoint.OrthogonalGridReference[this.m_cellId]
// 		this.m_x = mapPoint.m_x
// 		this.m_y = mapPoint.m_y
// 	}

// 	private fromCoords() {
// 		if (!MapPoint.m_initialized) {
// 			MapPoint.InitializeStaticGrid()
// 		}
// 		this.m_cellId =
// 			(this.m_x - this.m_y) * 14 + this.m_y + (this.m_x - this.m_y) / 2
// 	}

// 	private static InitializeStaticGrid() {
// 		MapPoint.m_initialized = true
// 		let num: number = 0
// 		let num2: number = 0
// 		let num3: number = 0
// 		let num4: number = 0
// 		while (num4 < 20) {
// 			let num5 = 0
// 			while (num5 < 14) {
// 				MapPoint.OrthogonalGridReference[num3++] = new MapPoint(
// 					undefined,
// 					num + num5,
// 					num2 + num5,
// 					undefined
// 				)
// 				num5++
// 			}
// 			num++
// 			num5 = 0
// 			while (num5 < 14) {
// 				MapPoint.OrthogonalGridReference[num3++] = new MapPoint(
// 					undefined,
// 					num + num5,
// 					num2 + num5,
// 					undefined
// 				)
// 				num5++
// 			}
// 			num2--
// 			num4++
// 		}
// 	}

// 	public static GetPoint(x?: number, y?: number, cell?: number): MapPoint {
// 		if (x !== undefined && y !== undefined) {
// 			return new MapPoint(undefined, x, y, undefined)
// 		} else if (cell !== undefined) {
// 			return new MapPoint(cell, undefined, undefined, undefined)
// 		} else {
// 			throw new Error("Invalid arguments")
// 		}
// 	}

// 	public isInMap(): boolean {
// 		return (
// 			this.m_x + this.m_y >= 0 &&
// 			this.m_x - this.m_y >= 0 &&
// 			this.m_x - this.m_y < 40 &&
// 			this.m_x + this.m_y < 28
// 		)
// 	}

// 	public distanceTo(point: MapPoint): number {
// 		return Math.sqrt((point.x - this.m_x) ** 2 + (point.y - this.m_y) ** 2)
// 	}

// 	public manhattanDistanceTo(point: MapPoint): number {
// 		return Math.abs(this.m_x - point.x) + Math.abs(this.m_y - point.y)
// 	}

// 	public squareDistanceTo(point: MapPoint): number {
// 		return Math.max(Math.abs(this.m_x - point.x), Math.abs(this.m_y - point.y))
// 	}

// 	public isAdjacentTo(point: MapPoint): boolean {
// 		return this.manhattanDistanceTo(point) === 1
// 	}

// 	public isOnSameLine(point: MapPoint): boolean {
// 		return point.x === this.m_x || point.y === this.m_y
// 	}

// 	public isOnSameDiagonal(point: MapPoint): boolean {
// 		return (
// 			point.x + point.y === this.m_x + this.m_y ||
// 			point.x - point.y === this.m_x - this.m_y
// 		)
// 	}

// 	public *getAllCellsInRectangle(
// 		oppositeCell: MapPoint,
// 		skipStartAndEndCells: boolean = true,
// 		predicate?: (point: MapPoint) => boolean
// 	): IterableIterator<MapPoint> {
// 		const minX = Math.min(oppositeCell.x, this.m_x)
// 		const minY = Math.min(oppositeCell.y, this.m_y)
// 		const maxX = Math.max(oppositeCell.x, this.m_x)
// 		const maxY = Math.max(oppositeCell.y, this.m_y)

// 		for (let i = minX; i <= maxX; i++) {
// 			for (let j = minY; j <= maxY; j++) {
// 				if (
// 					!skipStartAndEndCells ||
// 					((i !== this.m_x || j !== this.m_y) &&
// 						(i !== oppositeCell.x || j !== oppositeCell.y))
// 				) {
// 					let point = MapPoint.GetPoint(i, j) // Assurez-vous que GetPoint est bien implémenté
// 					if (point !== null && (predicate === undefined || predicate(point))) {
// 						yield point
// 					}
// 				}
// 			}
// 		}
// 	}

// 	public getCellsOnLineBetween(destination: MapPoint): MapPoint[] {
// 		let list: MapPoint[] = []
// 		let direction = this.orientationTo(destination, true)
// 		let mapPoint: MapPoint | null = this
// 		let num = 0

// 		while (num < 140) {
// 			mapPoint = mapPoint.getCellInDirection(direction, 1)
// 			if (mapPoint === null || mapPoint.cellId === destination.cellId) {
// 				break
// 			}
// 			list.push(mapPoint)
// 			num++
// 		}

// 		return list
// 	}

// 	public getCellInDirection(
// 		direction: DirectionsEnum,
// 		step: number
// 	): MapPoint | null {
// 		let mapPoint: MapPoint | null = null

// 		switch (direction) {
// 			case DirectionsEnum.DIRECTION_EAST:
// 				mapPoint = MapPoint.GetPoint(this.m_x + step, this.m_y + step)
// 				break
// 			case DirectionsEnum.DIRECTION_SOUTH_EAST:
// 				mapPoint = MapPoint.GetPoint(this.m_x + step, this.m_y)
// 				break
// 			case DirectionsEnum.DIRECTION_SOUTH:
// 				mapPoint = MapPoint.GetPoint(this.m_x + step, this.m_y - step)
// 				break
// 			case DirectionsEnum.DIRECTION_SOUTH_WEST:
// 				mapPoint = MapPoint.GetPoint(this.m_x, this.m_y - step)
// 				break
// 			case DirectionsEnum.DIRECTION_WEST:
// 				mapPoint = MapPoint.GetPoint(this.m_x - step, this.m_y - step)
// 				break
// 			case DirectionsEnum.DIRECTION_NORTH_WEST:
// 				mapPoint = MapPoint.GetPoint(this.m_x - step, this.m_y)
// 				break
// 			case DirectionsEnum.DIRECTION_NORTH:
// 				mapPoint = MapPoint.GetPoint(this.m_x - step, this.m_y + step)
// 				break
// 			case DirectionsEnum.DIRECTION_NORTH_EAST:
// 				mapPoint = MapPoint.GetPoint(this.m_x, this.m_y + step)
// 				break
// 		}

// 		if (mapPoint !== null && this.isInMap()) {
// 			return mapPoint
// 		} else {
// 			return null
// 		}
// 	}

// 	public getCellsInDirection(
// 		direction: DirectionsEnum,
// 		range: number
// 	): MapPoint[] {
// 		let points: MapPoint[] = new Array(range)

// 		for (let i = 1; i <= range; i++) {
// 			points[i - 1] = this.getCellInDirection(direction, i) as MapPoint
// 		}

// 		return points
// 	}

// 	public getNearestCellInDirection(direction: DirectionsEnum): MapPoint | null {
// 		return this.getCellInDirection(direction, 1)
// 	}

// 	public *getAdjacentCells(
// 		predicate: (cellId: number) => boolean
// 	): IterableIterator<MapPoint> {
// 		let mapPoint: MapPoint = new MapPoint(this.m_x + 1, this.m_y)
// 		if (this.isInMap() && predicate(mapPoint.cellId)) {
// 			yield mapPoint
// 		}

// 		let mapPoint2: MapPoint = new MapPoint(this.m_x, this.m_y - 1)
// 		if (this.isInMap() && predicate(mapPoint2.cellId)) {
// 			yield mapPoint2
// 		}

// 		let mapPoint3: MapPoint = new MapPoint(this.m_x, this.m_y + 1)
// 		if (this.isInMap() && predicate(mapPoint3.cellId)) {
// 			yield mapPoint3
// 		}

// 		let mapPoint4: MapPoint = new MapPoint(this.m_x - 1, this.m_y)
// 		if (this.isInMap() && predicate(mapPoint4.cellId)) {
// 			yield mapPoint4
// 		}
// 	}

// 	public static CoordToCellId(x: number, y: number) {
// 		if (!this.m_initialized) {
// 			this.InitializeStaticGrid()
// 		}
// 		return (x - y) * this.MapWidth + y + (x - y) / 2
// 	}

// 	public static CellIdToCoord(cellId: number): Point {
// 		if (!MapPoint.m_initialized) {
// 			MapPoint.InitializeStaticGrid()
// 		}
// 		let point = MapPoint.GetPoint(cellId)
// 		return new Point(point.x, point.y)
// 	}

// 	public orientationTo(
// 		point: MapPoint,
// 		diagonal: boolean = true
// 	): DirectionsEnum {
// 		const dx = point.x - this.m_x
// 		const dy = this.m_y - point.y
// 		const angleInDegrees = (Math.atan2(dy, dx) * 180) / Math.PI

// 		let orientation = diagonal
// 			? this.calculateDiagonalOrientation(angleInDegrees)
// 			: this.calculateCardinalOrientation(angleInDegrees)

// 		return orientation as DirectionsEnum
// 	}

// 	public orientationToAdjacent(point: MapPoint): DirectionsEnum {
// 		const directionVector = new Point(
// 			point.x > this.m_x ? 1 : point.x < this.m_x ? -1 : 0,
// 			point.y > this.m_y ? 1 : point.y < this.m_y ? -1 : 0
// 		)

// 		return this.getDirectionFromVector(directionVector)
// 	}

// 	private getDirectionFromVector(vector: Point): DirectionsEnum {
// 		if (this.arePointsEqual(vector, MapPoint.VectorRight)) {
// 			return DirectionsEnum.DIRECTION_EAST
// 		} else if (this.arePointsEqual(vector, MapPoint.VectorDownRight)) {
// 			return DirectionsEnum.DIRECTION_SOUTH_EAST
// 		} else if (this.arePointsEqual(vector, MapPoint.VectorDown)) {
// 			return DirectionsEnum.DIRECTION_SOUTH
// 		} else if (this.arePointsEqual(vector, MapPoint.VectorDownLeft)) {
// 			return DirectionsEnum.DIRECTION_SOUTH_WEST
// 		} else if (this.arePointsEqual(vector, MapPoint.VectorLeft)) {
// 			return DirectionsEnum.DIRECTION_WEST
// 		} else if (this.arePointsEqual(vector, MapPoint.VectorUpLeft)) {
// 			return DirectionsEnum.DIRECTION_NORTH_WEST
// 		} else if (this.arePointsEqual(vector, MapPoint.VectorUp)) {
// 			return DirectionsEnum.DIRECTION_NORTH
// 		} else if (this.arePointsEqual(vector, MapPoint.VectorUpRight)) {
// 			return DirectionsEnum.DIRECTION_NORTH_EAST
// 		} else {
// 			return DirectionsEnum.DIRECTION_EAST // Par défaut, ou si aucun match n'est trouvé
// 		}
// 	}

// 	private arePointsEqual(p1: Point, p2: Point): boolean {
// 		return p1.X === p2.X && p1.Y === p2.Y
// 	}

// 	private calculateDiagonalOrientation(angle: number): number {
// 		let orientation = Math.round(angle / 45) + 1
// 		return orientation < 0 ? orientation + 8 : orientation
// 	}

// 	private calculateCardinalOrientation(angle: number): number {
// 		let orientation = Math.round(angle / 90) * 2 + 1
// 		return orientation < 0 ? orientation + 8 : orientation
// 	}

// 	public get cellId(): number {
// 		return this.m_cellId
// 	}

// 	public set cellId(mcellId: number) {
// 		this.m_cellId = mcellId
// 		this.fromCellId()
// 	}

// 	public get x(): number {
// 		return this.m_x
// 	}

// 	public set x(mx: number) {
// 		this.m_x = mx
// 		this.fromCoords()
// 	}

// 	public get y(): number {
// 		return this.m_y
// 	}

// 	public set y(my: number) {
// 		this.m_y = my
// 		this.fromCoords()
// 	}
// }

// export default MapPoint

import { DirectionsEnum } from "@breakEmu_Protocol/IO"
import Point from "./Point"

class MapPoint {
	public static readonly MapWidth: number = 14
	public static readonly MapHeight: number = 20
	public static readonly MapSize: number = 560

	private static readonly VectorRight: Point = new Point(1, 1)
	private static readonly VectorDownRight: Point = new Point(1, 0)
	private static readonly VectorDown: Point = new Point(1, -1)
	private static readonly VectorDownLeft: Point = new Point(0, -1)
	private static readonly VectorLeft: Point = new Point(-1, -1)
	private static readonly VectorUpLeft: Point = new Point(-1, 0)
	private static readonly VectorUp: Point = new Point(-1, 1)
	private static readonly VectorUpRight: Point = new Point(0, 1)

	private static m_initialized: boolean = false
	private static readonly OrthogonalGridReference: MapPoint[] = new Array(
		MapPoint.MapSize
	)

	private m_cellId: number
	private m_x: number
	private m_y: number

	constructor(cellId?: number, x?: number, y?: number, point?: Point) {
		MapPoint.ensureInitialized()

		if (cellId !== undefined) {
			this.m_cellId = cellId
			this.fromCellId()
		} else if (point) {
			this.m_x = point.x
			this.m_y = point.y
			this.fromCoords()
		} else if (x !== undefined && y !== undefined) {
			this.m_x = x
			this.m_y = y
			this.fromCoords()
		} else {
			throw new Error("Invalid constructor parameters")
		}
	}

	private fromCellId(): void {
		if (this.m_cellId < 0 || this.m_cellId >= MapPoint.MapSize) {
			throw new Error(`Cell identifier out of bounds (${this.m_cellId}).`)
		}
		const mapPoint = MapPoint.OrthogonalGridReference[this.m_cellId]
		this.m_x = mapPoint.m_x
		this.m_y = mapPoint.m_y
	}

	private fromCoords(): void {
		this.m_cellId =
			(this.m_x - this.m_y) * MapPoint.MapWidth +
			this.m_y +
			Math.floor((this.m_x - this.m_y) / 2)
	}

	private static ensureInitialized(): void {
		if (!MapPoint.m_initialized) {
			MapPoint.InitializeStaticGrid()
		}
	}

	// private fromCellId() {
	// 	if (!MapPoint.m_initialized) {
	// 		MapPoint.InitializeStaticGrid()
	// 	}
	// 	if (this.m_cellId < 0 || this.m_cellId > 560) {
	// 		throw new Error("Cell identifier out of bounds (" + this.m_cellId + ").")
	// 	}
	// 	let mapPoint = MapPoint.OrthogonalGridReference[this.m_cellId]
	// 	this.m_x = mapPoint.m_x
	// 	this.m_y = mapPoint.m_y
	// }

	// private fromCoords() {
	// 	if (!MapPoint.m_initialized) {
	// 		MapPoint.InitializeStaticGrid()
	// 	}
	// 	this.m_cellId =
	// 		(this.m_x - this.m_y) * 14 + this.m_y + (this.m_x - this.m_y) / 2
	// }

	private static InitializeStaticGrid(): void {
		MapPoint.m_initialized = true
		const GRID_WIDTH = MapPoint.MapWidth
		const GRID_HEIGHT = MapPoint.MapHeight
		let gridIndex = 0
		let baseX = 0
		let baseY = 0

		for (let row = 0; row < GRID_HEIGHT; row++) {
			for (let col = 0; col < GRID_WIDTH; col++) {
				MapPoint.OrthogonalGridReference[gridIndex++] = new MapPoint(
					undefined,
					baseX + col,
					baseY + col,
					undefined
				)
			}

			baseX++

			for (let col = 0; col < GRID_WIDTH; col++) {
				MapPoint.OrthogonalGridReference[gridIndex++] = new MapPoint(
					undefined,
					baseX + col,
					baseY + col,
					undefined
				)
			}

			baseY--
		}

		if (gridIndex !== MapPoint.MapSize) {
			throw new Error(
				`Grid initialization error: Expected ${MapPoint.MapSize} points, but initialized ${gridIndex}`
			)
		}
	}

	public static GetPoint(x?: number, y?: number, cell?: number): MapPoint {
		if (x !== undefined && y !== undefined) {
			return new MapPoint(undefined, x, y, undefined)
		} else if (cell !== undefined) {
			return new MapPoint(cell, undefined, undefined, undefined)
		} else {
			throw new Error("Invalid arguments")
		}
	}

	public static isInMap(x: number, y: number): boolean {
		return x + y >= 0 && x - y >= 0 && x - y < 40 && x + y < 28
	}

	public static isValidCellId(cellId: number): boolean {
		return cellId >= 0 && cellId < MapPoint.MapSize
	}

	public distanceTo(point: MapPoint): number {
		return Math.sqrt((point.x - this.m_x) ** 2 + (point.y - this.m_y) ** 2)
	}

	public manhattanDistanceTo(point: MapPoint): number {
		return Math.abs(this.m_x - point.x) + Math.abs(this.m_y - point.y)
	}

	public squareDistanceTo(point: MapPoint): number {
		return Math.max(Math.abs(this.m_x - point.x), Math.abs(this.m_y - point.y))
	}

	public isAdjacentTo(point: MapPoint): boolean {
		return this.manhattanDistanceTo(point) === 1
	}

	public isOnSameLine(point: MapPoint): boolean {
		return point.x === this.m_x || point.y === this.m_y
	}

	public isOnSameDiagonal(point: MapPoint): boolean {
		return (
			point.x + point.y === this.m_x + this.m_y ||
			point.x - point.y === this.m_x - this.m_y
		)
	}

	public *getAllCellsInRectangle(
		oppositeCell: MapPoint,
		skipStartAndEndCells: boolean = true,
		predicate?: (point: MapPoint) => boolean
	): IterableIterator<MapPoint> {
		const minX = Math.min(oppositeCell.x, this.m_x)
		const minY = Math.min(oppositeCell.y, this.m_y)
		const maxX = Math.max(oppositeCell.x, this.m_x)
		const maxY = Math.max(oppositeCell.y, this.m_y)

		for (let i = minX; i <= maxX; i++) {
			for (let j = minY; j <= maxY; j++) {
				if (
					!skipStartAndEndCells ||
					((i !== this.m_x || j !== this.m_y) &&
						(i !== oppositeCell.x || j !== oppositeCell.y))
				) {
					let point = MapPoint.GetPoint(i, j) // Assurez-vous que GetPoint est bien implémenté
					if (point !== null && (predicate === undefined || predicate(point))) {
						yield point
					}
				}
			}
		}
	}

	public getCellsOnLineBetween(destination: MapPoint): MapPoint[] {
		let list: MapPoint[] = []
		let direction = this.orientationTo(destination, true)
		let mapPoint: MapPoint | null = this
		let num = 0

		while (num < 140) {
			mapPoint = mapPoint.getCellInDirection(direction, 1)
			if (mapPoint === null || mapPoint.cellId === destination.cellId) {
				break
			}
			list.push(mapPoint)
			num++
		}

		return list
	}

	public getCellInDirection(
		direction: DirectionsEnum,
		step: number
	): MapPoint | null {
		let mapPoint: MapPoint | null = null

		switch (direction) {
			case DirectionsEnum.DIRECTION_EAST:
				mapPoint = MapPoint.GetPoint(this.m_x + step, this.m_y + step)
				break
			case DirectionsEnum.DIRECTION_SOUTH_EAST:
				mapPoint = MapPoint.GetPoint(this.m_x + step, this.m_y)
				break
			case DirectionsEnum.DIRECTION_SOUTH:
				mapPoint = MapPoint.GetPoint(this.m_x + step, this.m_y - step)
				break
			case DirectionsEnum.DIRECTION_SOUTH_WEST:
				mapPoint = MapPoint.GetPoint(this.m_x, this.m_y - step)
				break
			case DirectionsEnum.DIRECTION_WEST:
				mapPoint = MapPoint.GetPoint(this.m_x - step, this.m_y - step)
				break
			case DirectionsEnum.DIRECTION_NORTH_WEST:
				mapPoint = MapPoint.GetPoint(this.m_x - step, this.m_y)
				break
			case DirectionsEnum.DIRECTION_NORTH:
				mapPoint = MapPoint.GetPoint(this.m_x - step, this.m_y + step)
				break
			case DirectionsEnum.DIRECTION_NORTH_EAST:
				mapPoint = MapPoint.GetPoint(this.m_x, this.m_y + step)
				break
		}

		if (mapPoint !== null && MapPoint.isInMap(mapPoint.m_x, mapPoint.m_y)) {
			return mapPoint
		} else {
			return null
		}
	}

	public getCellsInDirection(
		direction: DirectionsEnum,
		range: number
	): MapPoint[] {
		let points: MapPoint[] = new Array(range)

		for (let i = 1; i <= range; i++) {
			points[i - 1] = this.getCellInDirection(direction, i) as MapPoint
		}

		return points
	}

	public getNearestCellInDirection(direction: DirectionsEnum): MapPoint | null {
		return this.getCellInDirection(direction, 1)
	}

	public *getAdjacentCells(
		predicate: (cellId: number) => boolean
	): IterableIterator<MapPoint> {
		let mapPoint: MapPoint = new MapPoint(this.m_x + 1, this.m_y)
		const isInMap = MapPoint.isInMap(mapPoint.x, mapPoint.y)
		if (isInMap && predicate(mapPoint.cellId)) {
			yield mapPoint
		}

		let mapPoint2: MapPoint = new MapPoint(this.m_x, this.m_y - 1)
		if (isInMap && predicate(mapPoint2.cellId)) {
			yield mapPoint2
		}

		let mapPoint3: MapPoint = new MapPoint(this.m_x, this.m_y + 1)
		if (isInMap && predicate(mapPoint3.cellId)) {
			yield mapPoint3
		}

		let mapPoint4: MapPoint = new MapPoint(this.m_x - 1, this.m_y)
		if (isInMap && predicate(mapPoint4.cellId)) {
			yield mapPoint4
		}
	}

	public static CoordToCellId(x: number, y: number) {
		if (!this.m_initialized) {
			this.InitializeStaticGrid()
		}
		return (x - y) * this.MapWidth + y + (x - y) / 2
	}

	public static CellIdToCoord(cellId: number): Point {
		if (!MapPoint.m_initialized) {
			MapPoint.InitializeStaticGrid()
		}
		let point = MapPoint.GetPoint(cellId)
		return new Point(point.x, point.y)
	}

	public orientationTo(
		point: MapPoint,
		diagonal: boolean = true
	): DirectionsEnum {
		const dx = point.x - this.m_x
		const dy = this.m_y - point.y
		const angleInDegrees = (Math.atan2(dy, dx) * 180) / Math.PI

		let orientation = diagonal
			? this.calculateDiagonalOrientation(angleInDegrees)
			: this.calculateCardinalOrientation(angleInDegrees)

		return orientation as DirectionsEnum
	}

	public orientationToAdjacent(point: MapPoint): DirectionsEnum {
		const directionVector = new Point(
			point.x > this.m_x ? 1 : point.x < this.m_x ? -1 : 0,
			point.y > this.m_y ? 1 : point.y < this.m_y ? -1 : 0
		)

		return this.getDirectionFromVector(directionVector)
	}

	private getDirectionFromVector(vector: Point): DirectionsEnum {
		if (this.arePointsEqual(vector, MapPoint.VectorRight)) {
			return DirectionsEnum.DIRECTION_EAST
		} else if (this.arePointsEqual(vector, MapPoint.VectorDownRight)) {
			return DirectionsEnum.DIRECTION_SOUTH_EAST
		} else if (this.arePointsEqual(vector, MapPoint.VectorDown)) {
			return DirectionsEnum.DIRECTION_SOUTH
		} else if (this.arePointsEqual(vector, MapPoint.VectorDownLeft)) {
			return DirectionsEnum.DIRECTION_SOUTH_WEST
		} else if (this.arePointsEqual(vector, MapPoint.VectorLeft)) {
			return DirectionsEnum.DIRECTION_WEST
		} else if (this.arePointsEqual(vector, MapPoint.VectorUpLeft)) {
			return DirectionsEnum.DIRECTION_NORTH_WEST
		} else if (this.arePointsEqual(vector, MapPoint.VectorUp)) {
			return DirectionsEnum.DIRECTION_NORTH
		} else if (this.arePointsEqual(vector, MapPoint.VectorUpRight)) {
			return DirectionsEnum.DIRECTION_NORTH_EAST
		} else {
			return DirectionsEnum.DIRECTION_EAST // Par défaut, ou si aucun match n'est trouvé
		}
	}

	private arePointsEqual(p1: Point, p2: Point): boolean {
		return p1.X === p2.X && p1.Y === p2.Y
	}

	private calculateDiagonalOrientation(angle: number): number {
		let orientation = Math.round(angle / 45) + 1
		return orientation < 0 ? orientation + 8 : orientation
	}

	private calculateCardinalOrientation(angle: number): number {
		let orientation = Math.round(angle / 90) * 2 + 1
		return orientation < 0 ? orientation + 8 : orientation
	}

	public get cellId(): number {
		return this.m_cellId
	}

	public set cellId(mcellId: number) {
		this.m_cellId = mcellId
		this.fromCellId()
	}

	public get x(): number {
		return this.m_x
	}

	public set x(mx: number) {
		this.m_x = mx
		this.fromCoords()
	}

	public get y(): number {
		return this.m_y
	}

	public set y(my: number) {
		this.m_y = my
		this.fromCoords()
	}
}

export default MapPoint
