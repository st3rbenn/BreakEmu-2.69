import { EffectsEnum, ObjectEffect, TriggerTypeEnum } from "../../../../breakEmu_Server/IO"
import Trigger from "../trigger/Trigger"
import Triggers from "../trigger/Trigger"

abstract class Effect {
	private _effectId: number
	private _order: number
	private _targetId: number
	private _targetMask: string
	private _duration: number
	private _delay: number
	private _random: number
	private _group: number
	private _modificator: number
	private _trigger: string
	private _rawTriggers: string
	private _rawZone: string
	private _dispellable: number
  private _diceNum: number
  private _diceSide: number

  abstract _value: number

  abstract get value(): number
  abstract set value(value: number)

	private _triggers: Map<number, Triggers> = new Map<number, Triggers>()

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
  ) {
    this._effectId = effectId
    this._order = order
    this._targetId = targetId
    this._targetMask = targetMask
    this._duration = duration
    this._delay = delay
    this._random = random
    this._group = group
    this._modificator = modificator
    this._trigger = trigger
    this._rawTriggers = rawTriggers
    this._rawZone = rawZone
    this._dispellable = dispellable

    // this._triggers = this.parseTriggers()
  }


	private ParseTrigger(input: string): Trigger {
		let identifier: string = this.removeNumbers(input)

		let rawParameter: string = this.removeLetters(input)

		let parameter: number = 0

		if (rawParameter.length > 0) {
			parameter = parseInt(rawParameter)
		}

		switch (identifier) {
			case "PT":
				return new Trigger(TriggerTypeEnum.OnTeleportPortal)
			case "CT":
				return new Trigger(TriggerTypeEnum.OnTackle)
			case "CI":
				return new Trigger(TriggerTypeEnum.OnSummon)
			case "H":
				return new Trigger(TriggerTypeEnum.OnHealed)
			case "P":
				return new Trigger(TriggerTypeEnum.OnPushed)
			case "TE":
				return new Trigger(TriggerTypeEnum.OnTurnEnd)
			case "TB":
				return new Trigger(TriggerTypeEnum.OnTurnBegin)
			case "DI":
				return new Trigger(TriggerTypeEnum.OnDamagedBySummon)
			case "D":
				return new Trigger(TriggerTypeEnum.OnDamaged)
			case "DR":
				return new Trigger(TriggerTypeEnum.OnDamagedRange)
			case "DS":
				return new Trigger(TriggerTypeEnum.OnDamagedBySpell)
			case "DM":
				return new Trigger(TriggerTypeEnum.OnDamagedMelee)
			case "DA":
				return new Trigger(TriggerTypeEnum.OnDamagedAir)
			case "DF":
				return new Trigger(TriggerTypeEnum.OnDamagedFire)
			case "DN":
				return new Trigger(TriggerTypeEnum.OnDamagedNeutral)
			case "DE":
				return new Trigger(TriggerTypeEnum.OnDamagedEarth)
			case "DW":
				return new Trigger(TriggerTypeEnum.OnDamagedWater)
			case "PD":
				return new Trigger(TriggerTypeEnum.OnDamagedByPush)
			case "PMD":
				return new Trigger(TriggerTypeEnum.OnDamagedByAllyPush)
			case "DBE":
				return new Trigger(TriggerTypeEnum.OnDamagedByEnemy)
			case "DBA":
				return new Trigger(TriggerTypeEnum.OnDamagedByAlly)
			case "CDM":
				return new Trigger(TriggerTypeEnum.CasterInflictDamageMelee)
			case "CDR":
				return new Trigger(TriggerTypeEnum.CasterInflictDamageRange)
			case "CC":
				return new Trigger(TriggerTypeEnum.OnCriticalHit)
			case "M":
				return new Trigger(TriggerTypeEnum.OnMoved)
			case "X":
				return new Trigger(TriggerTypeEnum.OnDeath)
			case "I":
				return new Trigger(TriggerTypeEnum.Instant)
			case "EON":
				return new Trigger(TriggerTypeEnum.OnStateAdded, parameter)
			case "EOFF":
				return new Trigger(TriggerTypeEnum.OnStateRemoved, parameter)
			case "TP":
				return new Trigger(TriggerTypeEnum.OnTeleportPortal) // <---- TODO
			case "ATB":
				return new Trigger(TriggerTypeEnum.AfterTurnBegin)
			case "MPA":
				return new Trigger(TriggerTypeEnum.OnMPLost)
			case "APA":
				return new Trigger(TriggerTypeEnum.OnAPLost)
			case "CDBE":
				return new Trigger(TriggerTypeEnum.CasterInflictDamageEnnemy)
			case "V":
				return new Trigger(TriggerTypeEnum.OnLifePointsPending)
			case "R":
				return new Trigger(TriggerTypeEnum.OnRangeLost)
		}

		return new Trigger(TriggerTypeEnum.Unknown)
	}

  private parseTriggers(): Map<number, Triggers> {
    let result: Map<number, Triggers> = new Map<number, Triggers>()
    // if(this.rawTriggers.length === 0) {
    //   return result
    // }

    // const triggers: string[] = this.rawTriggers.split("|")

    // for(const trig of triggers) {
    //   const triggerSplit: string[] = trig.split(";")

    //   const triggerType: TriggerTypeEnum = this.ParseTrigger(triggerSplit[0]).type

    //   const triggerValue: number = parseInt(triggerSplit[1])

    //   const trigger: Trigger = new Trigger(triggerType, triggerValue)

    //   result.set(triggerType, trigger)
    // }

    return result
  }

	private removeNumbers(input: string): string {
		return input.replace(/[0-9]/g, "")
	}

	private removeLetters(input: string): string {
		return input.replace(/[a-zA-Z]/g, "")
	}

  public get effectEnum(): EffectsEnum {
    return this.effectId
  }

  public abstract getObjectEffect(): ObjectEffect

  public get effectId(): number {
		return this._effectId
	}

	public set effectId(effectId: number) {
		this._effectId = effectId
	}

	public get order(): number {
		return this._order
	}

	public set order(order: number) {
		this._order = order
	}

	public get targetId(): number {
		return this._targetId
	}

	public set targetId(targetId: number) {
		this._targetId = targetId
	}

	public get targetMask(): string {
		return this._targetMask
	}

	public set targetMask(targetMask: string) {
		this._targetMask = targetMask
	}

  public get diceNum(): number {
    return this._diceNum
  }

  public set diceNum(diceNum: number) {
    this._diceNum = diceNum
  }

  public get diceSide(): number {
    return this._diceSide
  }

  public set diceSide(diceSide: number) {
    this._diceSide = diceSide
  }

	public get duration(): number {
		return this._duration
	}

	public set duration(duration: number) {
		this._duration = duration
	}

	public get delay(): number {
		return this._delay
	}

	public set delay(delay: number) {
		this._delay = delay
	}

	public get random(): number {
		return this._random
	}

	public set random(random: number) {
		this._random = random
	}

	public get group(): number {
		return this._group
	}

	public set group(group: number) {
		this._group = group
	}

	public get modificator(): number {
		return this._modificator
	}

	public set modificator(modificator: number) {
		this._modificator = modificator
	}

	public get trigger(): string {
		return this._trigger
	}

	public set trigger(trigger: string) {
		this._trigger = trigger
	}

	public get rawTriggers(): string {
		return this._rawTriggers
	}

	public set rawTriggers(rawTriggers: string) {
		this._rawTriggers = rawTriggers
	}

	public get rawZone(): string {
		return this._rawZone
	}

	public set rawZone(rawZone: string) {
		this._rawZone = rawZone
	}

	public get dispellable(): number {
		return this._dispellable
	}

	public set dispellable(dispellable: number) {
		this._dispellable = dispellable
	}

  public get triggers(): Map<number, Triggers> {
    return this._triggers
  }

  public set triggers(triggers: Map<number, Triggers>) {
    this._triggers = triggers
  }

  public abstract saveAsJson(): string 
  
}

export default Effect
