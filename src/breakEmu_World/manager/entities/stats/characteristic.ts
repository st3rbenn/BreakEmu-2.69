import {
	CharacterCharacteristicDetailed,
	CharacteristicEnum,
} from "../../../../breakEmu_Server/IO"

class Characteristic {
	base: number
	additional: number
	objects: number
	context: number

	constructor(base: number, additional = 0, objects = 0, context = 0) {
		this.base = base
		this.additional = additional
		this.objects = objects
		this.context = context
	}

	public characterCharacteristicDetailed(
		characteristic: CharacteristicEnum
	): CharacterCharacteristicDetailed {
		return new CharacterCharacteristicDetailed(
			characteristic,
			this.base,
			this.additional,
			this.objects,
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

	public toJSON(): any {
		return {
			base: this.base,
			additional: this.additional,
			objects: this.objects,
			context: this.context,
		}
	}
}

export default Characteristic
