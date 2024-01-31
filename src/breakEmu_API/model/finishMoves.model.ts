import { FinishMoveInformations } from "../../breakEmu_Server/IO"

class Finishmoves {
	private _id: number
	private _duration: number
	private _free: boolean
	private _name: string
	private _category: number
	private _spellLevel: number

	private _finishMoveState: boolean = false

	private static _finishmoves: Map<number, Finishmoves> = new Map()

	constructor(
		id: number,
		duration: number,
		free: boolean,
		name: string,
		category: number,
		spellLevel: number
	) {
		this._id = id
		this._duration = duration
		this._free = free
		this._name = name
		this._category = category
		this._spellLevel = spellLevel
	}

	public get id(): number {
		return this._id
	}

	public set id(id: number) {
		this._id = id
	}

	public get duration(): number {
		return this._duration
	}

	public set duration(duration: number) {
		this._duration = duration
	}

	public get free(): boolean {
		return this._free
	}

	public set free(free: boolean) {
		this._free = free
	}

	public get name(): string {
		return this._name
	}

	public set name(name: string) {
		this._name = name
	}

	public get category(): number {
		return this._category
	}

	public set category(category: number) {
		this._category = category
	}

	public get finishMoveState(): boolean {
		return this._finishMoveState
	}

	public set finishMoveState(finishMoveState: boolean) {
		this._finishMoveState = finishMoveState
	}

	public get spellLevel(): number {
		return this._spellLevel
	}

	public set spellLevel(spellLevel: number) {
		this._spellLevel = spellLevel
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

		console.log("finishmoves by free", finishmoves)

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
