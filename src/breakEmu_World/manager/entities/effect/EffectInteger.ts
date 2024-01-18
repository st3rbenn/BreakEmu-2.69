import { EffectsEnum } from "../../../../breakEmu_Server/IO"
import Effect from "./Effect"

class EffectInteger extends Effect {
	private _value: number

	public get value(): number {
		return this._value
	}

	public set value(value: number) {
		this._value = value
	}

	constructor(effectId: number, value: number) {
		super(effectId)
    this.value = value
	}
}
