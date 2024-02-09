class MapScrollAction {
	private _id: number
	private _rightMapId: number
	private _leftMapId: number
	private _topMapId: number
	private _bottomMapId: number

	public static mapScrollActions: Map<number, MapScrollAction> = new Map<
		number,
		MapScrollAction
	>()

	constructor(
		id: number,
		rightMapId: number,
		leftMapId: number,
		topMapId: number,
		bottomMapId: number
	) {
		this._id = id
		this._rightMapId = rightMapId
		this._leftMapId = leftMapId
		this._topMapId = topMapId
		this._bottomMapId = bottomMapId
	}

	public get id(): number {
		return this._id
	}

	public set id(id: number) {
		this._id = id
	}

	public get rightMapId(): number {
		return this._rightMapId
	}

	public set rightMapId(rightMapId: number) {
		this._rightMapId = rightMapId
	}

	public get leftMapId(): number {
		return this._leftMapId
	}

	public set leftMapId(leftMapId: number) {
		this._leftMapId = leftMapId
	}

	public get topMapId(): number {
		return this._topMapId
	}

	public set topMapId(topMapId: number) {
		this._topMapId = topMapId
	}

	public get bottomMapId(): number {
		return this._bottomMapId
	}

	public set bottomMapId(bottomMapId: number) {
		this._bottomMapId = bottomMapId
	}

	public static getMapScrollAction(id: number): MapScrollAction {
		return this.mapScrollActions.get(id) as MapScrollAction
	}

	public static setMapScrollAction(mapScrollAction: MapScrollAction): void {
		this.mapScrollActions.set(mapScrollAction.id, mapScrollAction)
	}
}

export default MapScrollAction
