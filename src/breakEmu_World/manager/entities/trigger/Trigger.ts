import { TriggerTypeEnum } from "@breakEmu_Protocol/IO"

class Trigger {
	private _type: TriggerTypeEnum
	private _value: number | undefined

	public get type(): TriggerTypeEnum {
		return this._type
	}

	public set type(type: TriggerTypeEnum) {
		this._type = type
	}

	public get value(): number | undefined {
		return this._value
	}

	public set value(value: number | undefined) {
		this._value = value
	}

	constructor(type: TriggerTypeEnum, value?: number) {
		this.type = type
		this.value = value
	}

	public static asSingle(type: TriggerTypeEnum): Trigger {
		return new Trigger(type)
	}

  public equals(trigger: Trigger): boolean {
    return this.type === trigger.type && this.value === trigger.value
  }
}

export default Trigger
