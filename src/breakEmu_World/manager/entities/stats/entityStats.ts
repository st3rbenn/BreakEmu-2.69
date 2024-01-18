import ConfigurationManager from "../../../../breakEmu_Core/configuration/ConfigurationManager"
import {
	ActorExtendedAlignmentInformations,
	CharacterCharacteristic,
	CharacterCharacteristicsInformations,
	CharacteristicEnum,
  CharacterCharacteristicValue
} from "../../../../breakEmu_Server/IO"
import BreedManager from "../../../../breakEmu_World/manager/breed/BreedManager"
import ApCharacteristic from "./apCharacteristic"
import Characteristic from "./characteristic"
import MpCharacteristic from "./mpCharacteristic"
import ResistanceCharacteristic from "./resistanceCharacteristic"
import PointDodgeCharacteristic from "./pointDodgeCharacteristic"
import RelativeCharacteristic from "./relativeCharacteristic"
import RangeCharacteristic from "./rangeCharacteristic"
import Character from "../../../../breakEmu_API/model/character.model"
import Experience from "../../../../breakEmu_API/model/experience.model"

interface EntityStatsJSON {
	lifePoints: number
	maxLifePoints: number
	maxEnergyPoints: number
	energy: number
	criticalHitWeapon: number
	missingLifePoints: number
	lifePercentage: number
	characteristics: Map<CharacteristicEnum, Characteristic>
	strength: Characteristic | undefined
	vitality: Characteristic | undefined
	wisdom: Characteristic | undefined
	chance: Characteristic | undefined
	agility: Characteristic | undefined
	intelligence: Characteristic | undefined
}

class EntityStats {
	private static _baseSummonsLimit: number = 1
	private _lifePoints: number
	private _maxLifePoints: number
	private _maxEnergyPoints: number
	private _energy: number
	private _criticalHitWeapon: number
	private _missingLifePoints: number = this.maxLifePoints - this.lifePoints
	private _lifePercentage: number = this.lifePoints / this.maxLifePoints

	private _characteristics: Map<CharacteristicEnum, Characteristic> = new Map<
		CharacteristicEnum,
		Characteristic
	>()

	private _strength: Characteristic | undefined = this.getCharacteristic(
		CharacteristicEnum.STRENGTH
	)
	private _vitality: Characteristic | undefined = this.getCharacteristic(
		CharacteristicEnum.VITALITY
	)
	private _wisdom: Characteristic | undefined = this.getCharacteristic(
		CharacteristicEnum.WISDOM
	)
	private _chance: Characteristic | undefined = this.getCharacteristic(
		CharacteristicEnum.CHANCE
	)
	private _agility: Characteristic | undefined = this.getCharacteristic(
		CharacteristicEnum.AGILITY
	)
	private _intelligence: Characteristic | undefined = this.getCharacteristic(
		CharacteristicEnum.INTELLIGENCE
	)

	constructor(
		lifePoints: number,
		maxLifePoints: number,
		maxEnergyPoints: number,
		energy: number,
		criticalHitWeapon: number
	) {
		this._lifePoints = lifePoints
		this._maxLifePoints = maxLifePoints
		this._maxEnergyPoints = maxEnergyPoints
		this._energy = energy
		this._criticalHitWeapon = criticalHitWeapon
	}

	public initialize(): void {
		this.lifePoints = this.maxLifePoints
		this.energy = this.maxEnergyPoints

		let dodgePALost = this.getCharacteristic(
			CharacteristicEnum.DODGE_PALOST_PROBABILITY
		) as RelativeCharacteristic
		let paAttack = this.getCharacteristic(
			CharacteristicEnum.PAATTACK
		) as RelativeCharacteristic

		let dodgePMLost = this.getCharacteristic(
			CharacteristicEnum.DODGE_PMLOST_PROBABILITY
		) as RelativeCharacteristic
		let pmAttack = this.getCharacteristic(
			CharacteristicEnum.PMATTACK
		) as RelativeCharacteristic

		let tackleBlock = this.getCharacteristic(
			CharacteristicEnum.TACKLE_BLOCK
		) as RelativeCharacteristic
		let tackleEvade = this.getCharacteristic(
			CharacteristicEnum.TACKLE_EVADE
		) as RelativeCharacteristic

		let prospection = this.getCharacteristic(
			CharacteristicEnum.PROSPECTING
		) as RelativeCharacteristic

		dodgePALost.bind(this._wisdom!)
		paAttack.bind(this._wisdom!)

		dodgePMLost.bind(this._wisdom!)
		pmAttack.bind(this._wisdom!)

		tackleBlock.bind(this._agility!)
		tackleEvade.bind(this._agility!)

		prospection.bind(this._chance!)
	}

	public static new(level: number): EntityStats {
		let stats = new EntityStats(
			BreedManager._breedDefaultLife,
			BreedManager._breedDefaultLife,
			level * 100,
			level * 100,
			0
		)
		stats.setCharacteristic(
			CharacteristicEnum.ACTION_POINTS,
			ApCharacteristic.new(ConfigurationManager.getInstance().startAp)
		)
		stats.setCharacteristic(
			CharacteristicEnum.MOVEMENT_POINTS,
			MpCharacteristic.new(ConfigurationManager.getInstance().startMp)
		)
		stats.setCharacteristic(CharacteristicEnum.AGILITY, Characteristic.zero())
		stats.setCharacteristic(
			CharacteristicEnum.AIR_DAMAGE_BONUS,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.AIR_ELEMENT_REDUCTION,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.AIR_ELEMENT_RESIST_PERCENT,
			ResistanceCharacteristic.zero()
		)

		stats.setCharacteristic(
			CharacteristicEnum.ALL_DAMAGES_BONUS,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.DAMAGES_BONUS_PERCENT,
			Characteristic.zero()
		)

		stats.setCharacteristic(CharacteristicEnum.CHANCE, Characteristic.zero())
		stats.setCharacteristic(
			CharacteristicEnum.CRITICAL_DAMAGE_BONUS,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.CRITICAL_DAMAGE_REDUCTION,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.CRITICAL_HIT,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.INITIATIVE,
			Characteristic.zero()
		)

		stats.setCharacteristic(
			CharacteristicEnum.DODGE_PALOST_PROBABILITY,
			PointDodgeCharacteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.DODGE_PMLOST_PROBABILITY,
			PointDodgeCharacteristic.zero()
		)

		stats.setCharacteristic(
			CharacteristicEnum.EARTH_DAMAGE_BONUS,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.EARTH_ELEMENT_REDUCTION,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.EARTH_ELEMENT_RESIST_PERCENT,
			ResistanceCharacteristic.zero()
		)

		stats.setCharacteristic(
			CharacteristicEnum.FIRE_DAMAGE_BONUS,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.FIRE_ELEMENT_REDUCTION,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.FIRE_ELEMENT_RESIST_PERCENT,
			ResistanceCharacteristic.zero()
		)

		stats.setCharacteristic(
			CharacteristicEnum.GLYPH_POWER,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.RUNE_POWER,
			Characteristic.zero()
		)

		stats.setCharacteristic(
			CharacteristicEnum.PERMANENT_DAMAGE_PERCENT,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.HEAL_BONUS,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.INTELLIGENCE,
			Characteristic.zero()
		)

		stats.setCharacteristic(
			CharacteristicEnum.NEUTRAL_DAMAGE_BONUS,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.NEUTRAL_ELEMENT_REDUCTION,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.NEUTRAL_ELEMENT_RESIST_PERCENT,
			Characteristic.zero()
		)

		stats.setCharacteristic(
			CharacteristicEnum.PROSPECTING,
			RelativeCharacteristic.new(BreedManager._breedDefaultProspection)
		)

		stats.setCharacteristic(
			CharacteristicEnum.PUSH_DAMAGE_BONUS,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.PUSH_DAMAGE_REDUCTION,
			Characteristic.zero()
		)

		stats.setCharacteristic(
			CharacteristicEnum.RANGE,
			RangeCharacteristic.zero()
		)
		stats.setCharacteristic(CharacteristicEnum.REFLECT, Characteristic.zero())

		stats.setCharacteristic(CharacteristicEnum.STRENGTH, Characteristic.zero())

		stats.setCharacteristic(
			CharacteristicEnum.SUMMONABLE_CREATURES_BOOST,
			new Characteristic(this._baseSummonsLimit)
		)
		stats.setCharacteristic(
			CharacteristicEnum.TRAP_BONUS,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.TRAP_BONUS_PERCENT,
			Characteristic.zero()
		)

		stats.setCharacteristic(CharacteristicEnum.VITALITY, Characteristic.zero())

		stats.setCharacteristic(
			CharacteristicEnum.WATER_DAMAGE_BONUS,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.WATER_ELEMENT_REDUCTION,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.WATER_ELEMENT_RESIST_PERCENT,
			ResistanceCharacteristic.zero()
		)

		stats.setCharacteristic(
			CharacteristicEnum.WEAPON_DAMAGES_BONUS_PERCENT,
			Characteristic.zero()
		)

		stats.setCharacteristic(CharacteristicEnum.WISDOM, Characteristic.zero())

		stats.setCharacteristic(
			CharacteristicEnum.TACKLE_BLOCK,
			RelativeCharacteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.TACKLE_EVADE,
			RelativeCharacteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.PAATTACK,
			RelativeCharacteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.PMATTACK,
			RelativeCharacteristic.zero()
		)

		stats.setCharacteristic(
			CharacteristicEnum.MELEE_DAMAGE_DONE_PERCENT,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.MELEE_DAMAGE_RECEIVED_PERCENT,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.RANGED_DAMAGE_DONE_PERCENT,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.RANGED_DAMAGE_RECEIVED_PERCENT,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.SPELL_DAMAGE_DONE_PERCENT,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.SPELL_DAMAGE_RECEIVED_PERCENT,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.WEAPON_DAMAGE_DONE_PERCENT,
			Characteristic.zero()
		)
		stats.setCharacteristic(
			CharacteristicEnum.WEAPON_DAMAGE_RECEIVED_PERCENT,
			Characteristic.zero()
		)
		stats.setCharacteristic(CharacteristicEnum.WEIGHT, Characteristic.zero())
		stats.initialize()

		return stats
	}

	public characteristicsToJSON(): any {
		let characteristics: { [key: string]: any } = {}
		this.characteristics.forEach(
			(value: Characteristic, key: CharacteristicEnum) => {
				// Convertir la clé de l'énumération en chaîne
				let keyAsString = CharacteristicEnum[key]
				characteristics[keyAsString] = value.toJSON()
			}
		)
		return characteristics
	}

	public saveAsJSON(): EntityStatsJSON {
		return {
			lifePoints: this.lifePoints,
			maxLifePoints: this.maxLifePoints,
			maxEnergyPoints: this.maxEnergyPoints,
			energy: this.energy,
			criticalHitWeapon: this.criticalHitWeapon,
			missingLifePoints: this._missingLifePoints,
			lifePercentage: this._lifePercentage,
			characteristics: this.characteristicsToJSON(),
			strength: this.getCharacteristic(CharacteristicEnum.STRENGTH),
			vitality: this.getCharacteristic(CharacteristicEnum.VITALITY),
			wisdom: this.getCharacteristic(CharacteristicEnum.WISDOM),
			chance: this.getCharacteristic(CharacteristicEnum.CHANCE),
			agility: this.getCharacteristic(CharacteristicEnum.AGILITY),
			intelligence: this.getCharacteristic(CharacteristicEnum.INTELLIGENCE),
		}
	}

	public static loadFromJSON(json: any): EntityStats {
		let stats = new EntityStats(
			json.lifePoints,
			json.maxLifePoints,
			json.maxEnergyPoints,
			json.energy,
			json.criticalHitWeapon
		)

    stats._characteristics = new Map<CharacteristicEnum, Characteristic>()

    for (let key in json.characteristics) {
      let characteristic = json.characteristics[key]
      let keyAsString = CharacteristicEnum[key as keyof typeof CharacteristicEnum]
      stats.setCharacteristic(keyAsString, new Characteristic(characteristic.base, characteristic.additional, characteristic.objects, characteristic.context))
    }


		stats._missingLifePoints = json.missingLifePoints
		stats._lifePercentage = json.lifePercentage
		stats._strength = json.strength
		stats._vitality = json.vitality
		stats._wisdom = json.wisdom
		stats._chance = json.chance
		stats._agility = json.agility
		stats._intelligence = json.intelligence
		return stats
	}

	public get characteristics(): Map<CharacteristicEnum, Characteristic> {
		return this._characteristics
	}

	public get strength(): Characteristic | undefined {
		return this._strength
	}

	public get vitality(): Characteristic | undefined {
		return this._vitality
	}

	public get wisdom(): Characteristic | undefined {
		return this._wisdom
	}

	public get chance(): Characteristic | undefined {
		return this._chance
	}

	public get agility(): Characteristic | undefined {
		return this._agility
	}

	public get intelligence(): Characteristic | undefined {
		return this._intelligence
	}

	public get missingLifePoints(): number {
		return this._missingLifePoints
	}

	public getCharacteristic(
		key: CharacteristicEnum
	): Characteristic | undefined {
		return this._characteristics.get(key)
	}

	public setCharacteristic(
		key: CharacteristicEnum,
		value: Characteristic
	): void {
		this._characteristics.set(key, value)
	}

	public get lifePoints(): number {
		return this._lifePoints
	}

	public set lifePoints(lifePoints: number) {
		this._lifePoints = lifePoints
	}

	public get maxLifePoints(): number {
		return this._maxLifePoints
	}

	public set maxLifePoints(maxLifePoints: number) {
		this._maxLifePoints = maxLifePoints
	}

	public get maxEnergyPoints(): number {
		return this._maxEnergyPoints
	}

	public set maxEnergyPoints(maxEnergyPoints: number) {
		this._maxEnergyPoints = maxEnergyPoints
	}

	public get energy(): number {
		return this._energy
	}

	public set energy(energy: number) {
		this._energy = energy
	}

	public get criticalHitWeapon(): number {
		return this._criticalHitWeapon
	}

	public set criticalHitWeapon(criticalHitWeapon: number) {
		this._criticalHitWeapon = criticalHitWeapon
	}

	public getCharacterCharacteristicInformations(character: Character) {
		const alignementInfos: ActorExtendedAlignmentInformations = new ActorExtendedAlignmentInformations(
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		)

		const stats = new CharacterCharacteristicsInformations(
			character.experience,
			Experience.getCharacterExperienceLevelFloor(character.level),
			Experience.getCharacterExperienceNextLevelFloor(character.level),
			0,
			character.kamas,
			alignementInfos,
			this.getCharacterCharacteristic(),
			0,
			[],
			0
		)

		return stats
	}

	public getCharacterCharacteristic(
		selected: CharacteristicEnum[] | null = null
	): CharacterCharacteristic[] {
		let result: Map<CharacteristicEnum, CharacterCharacteristic> = new Map<
			CharacteristicEnum,
			CharacterCharacteristic
		>()

		if(selected == null) {
		  this._characteristics.forEach((value: Characteristic, key: CharacteristicEnum) => {
		    result.set(key, value.characterCharacteristicDetailed(key))
		  })
		} else {
		  let characteristics = this._characteristics.keys()

		  for(let i = 0; i < selected.length; i++) {
		    if(characteristics.next().value == selected[i]) {
		      result.set(selected[i], this._characteristics.get(selected[i])?.characterCharacteristicDetailed(selected[i]) as CharacterCharacteristic)
		    }
		  }
		}

    const lifePoint = CharacteristicEnum.LIFE_POINTS
    const maxLifePoint = CharacteristicEnum.MAX_LIFE_POINTS
    const maxEnergyPoint = CharacteristicEnum.MAX_ENERGY_POINTS
    const energyPoint = CharacteristicEnum.ENERGY_POINTS

		result.set(lifePoint, new CharacterCharacteristicValue(lifePoint, this.lifePoints))
		result.set(maxLifePoint, new CharacterCharacteristicValue(maxLifePoint, this.maxLifePoints))
		result.set(maxEnergyPoint, new CharacterCharacteristicValue(maxEnergyPoint, this.maxEnergyPoints))
		result.set(energyPoint, new CharacterCharacteristicValue(energyPoint, this.energy))

		return Array.from(result.values())
	}
}

export default EntityStats
