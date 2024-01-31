import {
	EffectsEnum,
	ObjectEffect,
	ObjectEffectInteger,
} from "../../../../breakEmu_Server/IO"
import Effect from "./Effect"

class EffectInteger extends Effect {
	public _value: number

	constructor(
		effectId: number,
		order: number,
		targetId: number,
		targetMask: string,
		duration: number,
		delay: number,
		random: number,
		group: number,
		modificator: number,
		trigger: string,
		rawTriggers: string,
		rawZone: string,
		dispellable: number,
		value: number,
	) {
		super(
			effectId,
			order,
			targetId,
			targetMask,
			duration,
			delay,
			random,
			group,
			modificator,
			trigger,
			rawTriggers,
			rawZone,
			dispellable,
		)
		this._value = value
	}

	public override getObjectEffect(): ObjectEffect {
		return new ObjectEffectInteger(this.effectId, this.value)
	}

	public equals(obj: any): boolean {
		if (!(obj instanceof EffectInteger)) return false
		const effect = obj as EffectInteger
		return this.effectId === effect.effectId && this.value === effect.value
	}

	public clone(): EffectInteger {
		const cloned = new EffectInteger(
			this.effectId,
			this.order,
			this.targetId,
			this.targetMask,
			this.duration,
			this.delay,
			this.random,
			this.group,
			this.modificator,
			this.trigger,
			this.rawTriggers,
			this.rawZone,
			this.dispellable,
			this.value,
		)
		// Copy other relevant properties if needed
		return cloned
	}

	public saveAsJson(): any {
		return {
      effectId: this.effectId,
      value: this.value,
      order: this.order,
      targetId: this.targetId,
      targetMask: this.targetMask,
      duration: this.duration,
      delay: this.delay,
      random: this.random,
      group: this.group,
      modificator: this.modificator,
      trigger: this.trigger,
      rawTriggers: this.rawTriggers,
      rawZone: this.rawZone,
      dispellable: this.dispellable,
    }
	}

  public get value(): number {
    return this._value
  }

  public set value(value: number) {
    this._value = value
  }
}

export default EffectInteger
