import Character from "@breakEmu_API/model/character.model"
import Logger from "@breakEmu_Core/Logger"
import { CharacteristicEnum, EffectsEnum } from "@breakEmu_Protocol/IO"
import EffectCollection from "../entities/effect/EffectCollection"
import EntityStats from "../entities/stats/entityStats"

class ItemEffectsManager {
	private logger: Logger = new Logger("ItemEffectsManager")

	public static _instance: ItemEffectsManager

	public static getInstance(): ItemEffectsManager {
		if (!ItemEffectsManager._instance) {
			ItemEffectsManager._instance = new ItemEffectsManager()
		}

		return ItemEffectsManager._instance
	}

	public async addEffects(character: Character, effects: EffectCollection) {
		for (const [_, effect] of effects.effects) {
			const charactStats = character.stats as EntityStats

			// console.log("effect", effect)

			switch (effect.effectId) {
				case EffectsEnum.Effect_AddInitiative:
					const initiative = charactStats.getCharacteristic(
						CharacteristicEnum.INITIATIVE
					)
					if (initiative) {
						initiative.objects += effect.value
					}
					break
				case EffectsEnum.Effect_AddStrength:
					const strength = charactStats.getCharacteristic(
						CharacteristicEnum.STRENGTH
					)

					if (strength) {
						strength.objects += effect.value
					}
					break
				case EffectsEnum.Effect_AddVitality:
					const vitality = charactStats.getCharacteristic(
						CharacteristicEnum.VITALITY
					)
					if (vitality) {
						vitality.objects += effect.value
					}
					break
				case EffectsEnum.Effect_AddIntelligence:
					const intelligence = charactStats.getCharacteristic(
						CharacteristicEnum.INTELLIGENCE
					)
					if (intelligence) {
						intelligence.objects += effect.value
					}
					break
				case EffectsEnum.Effect_AddAgility:
					const agility = charactStats.getCharacteristic(
						CharacteristicEnum.AGILITY
					)
					if (agility) {
						agility.objects += effect.value
					}
					break
				case EffectsEnum.Effect_AddChance:
					const chance = charactStats.getCharacteristic(
						CharacteristicEnum.CHANCE
					)
					if (chance) {
						chance.objects += effect.value
					}
					break
				case EffectsEnum.Effect_AddWisdom:
					const wisdom = charactStats.getCharacteristic(
						CharacteristicEnum.WISDOM
					)
					if (wisdom) {
						wisdom.objects += effect.value
					}
					break
				case EffectsEnum.Effect_IncreaseWeight:
          (character.stats as EntityStats).currentMaxWeight += effect.value
					break
				case EffectsEnum.Effect_NonExchangeable_981:
					console.log("Effect_NonExchangeable_981")
					break
				default:
					console.log("effect not handled", effect.effectId)
					break
			}
		}
	}

	public async removeEffects(character: Character, effects: EffectCollection) {
		for (const [_, effect] of effects.effects) {
			const charactStats = character.stats as EntityStats

			console.log("effect", effect.effectId)

			switch (effect.effectId) {
				case EffectsEnum.Effect_AddInitiative:
					const initiative = charactStats.getCharacteristic(
						CharacteristicEnum.INITIATIVE
					)
					if (initiative) {
						initiative.objects -= effect.value
					}
					break
				case EffectsEnum.Effect_AddStrength:
					const strength = charactStats.getCharacteristic(
						CharacteristicEnum.STRENGTH
					)

					if (strength) {
						strength.objects -= effect.value
					}
					break
				case EffectsEnum.Effect_AddVitality:
					const vitality = charactStats.getCharacteristic(
						CharacteristicEnum.VITALITY
					)
					if (vitality) {
						vitality.objects -= effect.value
					}
					break
				case EffectsEnum.Effect_AddIntelligence:
					const intelligence = charactStats.getCharacteristic(
						CharacteristicEnum.INTELLIGENCE
					)
					if (intelligence) {
						intelligence.objects -= effect.value
					}
					break
				case EffectsEnum.Effect_AddAgility:
					const agility = charactStats.getCharacteristic(
						CharacteristicEnum.AGILITY
					)
					if (agility) {
						agility.objects -= effect.value
					}
					break
				case EffectsEnum.Effect_AddChance:
					const chance = charactStats.getCharacteristic(
						CharacteristicEnum.CHANCE
					)
					if (chance) {
						chance.objects -= effect.value
					}
					break
				case EffectsEnum.Effect_AddWisdom:
					const wisdom = charactStats.getCharacteristic(
						CharacteristicEnum.WISDOM
					)
					if (wisdom) {
						wisdom.objects -= effect.value
					}
					break
				case EffectsEnum.Effect_IncreaseWeight:
          (character.stats as EntityStats).currentMaxWeight -= effect.value
					break
				case EffectsEnum.Effect_NonExchangeable_981:
					console.log("Effect_NonExchangeable_981")
					break
				default:
					console.log("effect not handled", effect.effectId)
					break
			}
		}
	}
}

export default ItemEffectsManager
