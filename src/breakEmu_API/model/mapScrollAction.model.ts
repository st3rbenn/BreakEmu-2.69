class MapScrollAction {
	id: number
	rightMapId: number
	leftMapId: number
	topMapId: number
	bottomMapId: number

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
		this.id = id
		this.rightMapId = rightMapId
		this.leftMapId = leftMapId
		this.topMapId = topMapId
		this.bottomMapId = bottomMapId
	}

	public static getMapScrollAction(id: number): MapScrollAction {
		return this.mapScrollActions.get(id) as MapScrollAction
	}

	public static setMapScrollAction(mapScrollAction: MapScrollAction): void {
		this.mapScrollActions.set(mapScrollAction.id, mapScrollAction)
	}
}

export default MapScrollAction
