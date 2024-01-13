import {
	CharacterCharacteristicDetailed,
	CharacteristicEnum,
} from "../../../../breakEmu_Server/IO"

class Characteristic {
	private _base: number
	private _additional: number
	private _objects: number
	private _context: number

	constructor(base: number, additional = 0, objects = 0, context = 0) {
		this._base = base
		this._additional = additional
		this._objects = objects
		this._context = context
	}

	public characterCharacteristicDetailed(
		characteristic: CharacteristicEnum
	): CharacterCharacteristicDetailed {
		return new CharacterCharacteristicDetailed(
			characteristic,
			this._base,
			this._additional,
			this._objects,
			0,
			this.context
		)
	}

	public Total(): number {
		return this.base + this.additional + this.objects
	}
	public TotalInContext(): number {
		return this.Total() + this.context
	}

	public static zero(): Characteristic {
		return new Characteristic(0)
	}

	public get base(): number {
		return this._base
	}

	public set base(base: number) {
		this._base = base
	}

	public get additional(): number {
		return this._additional
	}

	public set additional(additional: number) {
		this._additional = additional
	}

	public get objects(): number {
		return this._objects
	}

	public set objects(objects: number) {
		this._objects = objects
	}

	public get context(): number {
		return this._context
	}

	public set context(context: number) {
		this._context = context
	}

  public toJSON(): any {
    return {
      base: this.base,
      additional: this.additional,
      objects: this.objects,
      context: this.context
    }
  }
}

export default Characteristic
