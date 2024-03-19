import { FinishMoveInformations } from "../../breakEmu_Server/IO"

class Finishmoves {
	id: number
	duration: number
	free: boolean
	name: string
	category: number
	spellLevel: number

	finishMoveState: boolean = false

	private static _finishmoves: Map<number, Finishmoves> = new Map()

	constructor(
		id: number,
		duration: number,
		free: boolean,
		name: string,
		category: number,
		spellLevel: number
	) {
		this.id = id
		this.duration = duration
		this.free = free
		this.name = name
		this.category = category
		this.spellLevel = spellLevel
	}

	public static getFinishmovesById(id: number): Finishmoves | undefined {
		return this._finishmoves.get(id)
	}

	public static getFinishmovesByFree(free: boolean): Map<number, Finishmoves> {
		let finishmoves: Map<number, Finishmoves> = new Map()

		this._finishmoves.forEach((fm) => {
			if (fm.free === free) {
				fm.finishMoveState = true
				finishmoves.set(fm.id, fm)
			}
		})

		return finishmoves
	}

	public static addFinishmoves(finishmoves: Finishmoves): void {
		this._finishmoves.set(finishmoves.id, finishmoves)
	}

	public static get finishmoves(): Map<number, Finishmoves> {
		return this._finishmoves
	}

	public toFinishMoveInformations(): FinishMoveInformations {
		return new FinishMoveInformations(this.id, this.free)
	}

	public static loadFromJson(json: any): Map<number, Finishmoves> {
		let finishmoves: Map<number, Finishmoves> = new Map()

		json.forEach((fm: any) => {
			finishmoves.set(fm.id, this.getFinishmovesById(fm.id) as Finishmoves)
		})

		return finishmoves
	}
}

export default Finishmoves
