import { EffectsEnum, ObjectEffect, TriggerTypeEnum } from "@breakEmu_Protocol/IO"
import Trigger from "../trigger/Trigger"
import Triggers from "../trigger/Trigger"

abstract class Effect {
	effectId: number
	order: number
	targetId: number
	targetMask: string
	duration: number
	delay: number
	random: number
	group: number
	modificator: number
	trigger: string
	rawTriggers: string
	rawZone: string
	dispellable: number
  diceNum: number
  diceSide: number

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
    this.effectId = effectId
    this.order = order
    this.targetId = targetId
    this.targetMask = targetMask
    this.duration = duration
    this.delay = delay
    this.random = random
    this.group = group
    this.modificator = modificator
    this.trigger = trigger
    this.rawTriggers = rawTriggers
    this.rawZone = rawZone
    this.dispellable = dispellable

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

  public abstract saveAsJson(): string 
}

export default Effect
