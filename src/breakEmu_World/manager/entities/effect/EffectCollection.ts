import { EffectsEnum, ObjectEffect } from "@breakEmu_Protocol/IO"
import AsyncRandom from "../../AsyncRandom"
import Effect from "./Effect"
import EffectDice from "./EffectDice"

class EffectCollection {
	private static diceEffects: EffectsEnum[] = [
		EffectsEnum.Effect_CastSpell_1175,
		EffectsEnum.Effect_DamageNeutral,
		EffectsEnum.Effect_DamageFire,
		EffectsEnum.Effect_DamageAir,
		EffectsEnum.Effect_DamageEarth,
		EffectsEnum.Effect_DamageWater,
		EffectsEnum.Effect_StealHPWater,
		EffectsEnum.Effect_StealHPEarth,
		EffectsEnum.Effect_StealHPAir,
		EffectsEnum.Effect_StealHPFire,
		EffectsEnum.Effect_StealHPNeutral,
		EffectsEnum.Effect_RemoveAP,
		EffectsEnum.Effect_RemainingFights,
		EffectsEnum.Effect_StealKamas,
		EffectsEnum.Effect_HealHP_108,
	]

	public effects: Map<number, Effect> = new Map<number, Effect>()

	constructor(effects: Effect[] = []) {
		if(effects) {
      for (const effect of effects) {
        this.effects.set(effect.effectId, effect)
      }
    } else {
      this.effects = new Map<number, Effect>()
    }
	}

	*[Symbol.iterator]() {
		for (let effect of this.effects) {
			yield effect
		}
	}

	public isAssociated() {
		return (
			this.exists(EffectsEnum.Effect_LivingObjectId) ||
			this.exists(EffectsEnum.Effect_Apparence_Wrapper) ||
			this.exists(EffectsEnum.Effect_Appearance)
		)
	}

	public generate(perfect: boolean = false) {
		const result: EffectCollection = new EffectCollection()

		const random = new AsyncRandom()

		for (const effect of this.ofType<EffectDice>(EffectDice)) {
      if (EffectCollection.diceEffects.includes(effect.effectEnum)) {
        result.effects.set(effect.effectId, effect.clone())
			} else {
				result.effects.set(effect.effectId, effect.generate(random, perfect))
      }
			
		}

    return result
	}

	public getObjectEffects(): ObjectEffect[] {
		const result: ObjectEffect[] = []

		for (const effect of this.effects.values()) {
			result.push(effect.getObjectEffect())
		}

		return result
	}

	public ofType<T extends Effect>(type: { new (...args: any[]): T }): T[] {
		const result: T[] = []

		for (const effect of this.effects.values()) {
			if (effect instanceof type) {
				result.push(effect as T)
			}
		}

		return result
	}

	public exists(effectId: number): boolean {
		return this.effects.has(effectId)
	}

  public sequenceEqual(effectCollection: EffectCollection): boolean {
    if(this.effects.size !== effectCollection.effects.size) {
      return false
    }

    for(const effect of this.effects.values()) {
      if(!effectCollection.effects.has(effect.effectId)) {
        return false
      }
    }

    return true
  }

  public saveAsJson(): string {
    const result: any = []

    for(const effect of this.effects.values()) {
      result.push(effect.saveAsJson())
    }

    return JSON.stringify(result)
  }

  public static loadFromJson(json: string): EffectCollection {
    const result: EffectCollection = new EffectCollection()

    const effects = JSON.parse(json)

    // for(const effect of effects) {
    //   result.effects.set(effect.effectId, )
    // }

    return result
  }
}

export default EffectCollection
