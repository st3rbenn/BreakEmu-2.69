import { EffectsEnum } from "../../../../breakEmu_Server/IO"
import Effect from "./Effect"

class EffectCollection {
	private static diceEffect: EffectsEnum[] = [
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

	private effects: Map<number, Effect> = new Map<number, Effect>()

	constructor(effects: Effect[] = []) {
		effects?.forEach((effect) => {
			this.effects.set(effect.effectId, effect)
		})
	}

  // public generate(perfect: boolean = false) {
  //   const result: EffectCollection = new EffectCollection()

  //   for(const effect in this.ofType<EffectDice>) {}
  // }

  public ofType<T extends Effect>(type: EffectsEnum): T[] {
    const result: T[] = []

    for(const effect of this.effects.values()) {
      if(effect.effectId === type) {
        result.push(effect as T)
      }
    }

    return result
  }


}

export default EffectCollection
