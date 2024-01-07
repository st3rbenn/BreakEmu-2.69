import { CharacteristicEnum } from "../../../../breakEmu_Server/IO"
import Characteristic from "./characteristic"

class EntityStats {
	private _baseSummonsLimit: number
	private _lifePoints: number
	private _maxLifePoints: number
	private _lifePercentage: number
	private _missingLifePoints: number
	private _maxEnergyPoints: number
	private _criticalHitWeapon: number

  private _characteristics: Map<CharacteristicEnum, Characteristic> = new Map<CharacteristicEnum, Characteristic>()

  private _strength: Characteristic = this[CharacteristicEnum.STRENGTH]
  private _vitality: Characteristic = this[CharacteristicEnum.VITALITY]
  private _wisdom: Characteristic = this[CharacteristicEnum.WISDOM]
  private _chance: Characteristic = this[CharacteristicEnum.CHANCE]
  private _agility: Characteristic = this[CharacteristicEnum.AGILITY]
  private _intelligence: Characteristic = this[CharacteristicEnum.INTELLIGENCE]
}

export default EntityStats
