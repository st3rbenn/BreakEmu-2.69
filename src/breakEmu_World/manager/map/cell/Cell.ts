import { CellData } from "@breakEmu_API/model/map.model"

class Cell {
	id: number
	blue: boolean
	red: boolean
	losMov: number
	mapChangeData: number

	constructor(
		id: number,
		blue: boolean,
		red: boolean,
		losMov: number,
		mapChangeData: number
	) {
		this.id = id
		this.blue = blue
		this.red = red
		this.losMov = losMov
		this.mapChangeData = mapChangeData
	}

	public isWalkable(): boolean {
		return (this.losMov & 1) == 0
	}

	public save(): CellData {
		return {
			id: this.id,
			blue: this.blue,
			red: this.red,
			losMov: this.losMov,
			mapChangeData: this.mapChangeData,
		}
	}
}

export default Cell
