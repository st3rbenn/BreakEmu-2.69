import {CellData} from "../../../../breakEmu_API/model/map.model";

class Cell {
	private _id: number
	private _blue: boolean
	private _red: boolean
	private _losMov: number
	private _mapChangeData: number

	constructor(
		id: number,
		blue: boolean,
		red: boolean,
		losMov: number,
		mapChangeData: number
	) {
		this._id = id
		this._blue = blue
		this._red = red
		this._losMov = losMov
		this._mapChangeData = mapChangeData
	}

	public get id(): number {
		return this._id
	}

	public get blue(): boolean {
		return this._blue
	}

	public get red(): boolean {
		return this._red
	}

	public get losMov(): number {
		return this._losMov
	}

	public get mapChangeData(): number {
		return this._mapChangeData
	}

	public save(): CellData {
		return {
			id: this.id,
			blue: this.blue,
			red: this.red,
			losMov: this.losMov,
			mapChangeData: this.mapChangeData
		}
	}
}

export default Cell
