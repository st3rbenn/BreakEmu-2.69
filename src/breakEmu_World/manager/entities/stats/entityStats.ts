import ConfigurationManager from "../../../../breakEmu_Core/configuration/ConfigurationManager"
import {
	ActorExtendedAlignmentInformations,
	CharacterCharacteristic,
	CharacterCharacteristicsInformations,
	CharacteristicEnum,
	CharacterCharacteristicValue,
	StatsBoostEnum,
	SpellModifierMessage,
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
import WorldClient from "breakEmu_World/WorldClient"

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
	totalWeight: number | undefined
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
	private _currentMaxWeight: number = 1000

	private _characteristics: Map<CharacteristicEnum, Characteristic> = new Map<
		CharacteristicEnum,
		Characteristic
	>()

	public client: WorldClient | undefined = undefined

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

	[Symbol.iterator](): Iterator<[CharacteristicEnum, Characteristic]> {
		return this._characteristics.entries()
	}

	public getCharacteristicToBoost(statId: StatsBoostEnum): Characteristic {
		switch (statId) {
			case StatsBoostEnum.STRENGTH:
				return this.getCharacteristic(
					CharacteristicEnum.STRENGTH
				) as Characteristic
			case StatsBoostEnum.VITALITY:
				return this.getCharacteristic(
					CharacteristicEnum.VITALITY
				) as Characteristic
			case StatsBoostEnum.WISDOM:
				return this.getCharacteristic(
					CharacteristicEnum.WISDOM
				) as Characteristic
			case StatsBoostEnum.CHANCE:
				return this.getCharacteristic(
					CharacteristicEnum.CHANCE
				) as Characteristic
			case StatsBoostEnum.AGILITY:
				return this.getCharacteristic(
					CharacteristicEnum.AGILITY
				) as Characteristic
			case StatsBoostEnum.INTELLIGENCE:
				return this.getCharacteristic(
					CharacteristicEnum.INTELLIGENCE
				) as Characteristic
		}
	}

	public initialize(): void {
		this.lifePoints = this.maxLifePoints
		this.energy = this._maxEnergyPoints

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

		const commonCharacteristics = [
			CharacteristicEnum.AGILITY,
			CharacteristicEnum.AIR_DAMAGE_BONUS,
			CharacteristicEnum.AIR_ELEMENT_REDUCTION,
			CharacteristicEnum.CHANCE,
			CharacteristicEnum.WATER_DAMAGE_BONUS,
			CharacteristicEnum.WATER_ELEMENT_REDUCTION,
			CharacteristicEnum.INTELLIGENCE,
			CharacteristicEnum.FIRE_DAMAGE_BONUS,
			CharacteristicEnum.FIRE_ELEMENT_REDUCTION,
			CharacteristicEnum.STRENGTH,
			CharacteristicEnum.EARTH_DAMAGE_BONUS,
			CharacteristicEnum.EARTH_ELEMENT_REDUCTION,
			CharacteristicEnum.ALL_DAMAGES_BONUS,
			CharacteristicEnum.DAMAGES_BONUS_PERCENT,
			CharacteristicEnum.CRITICAL_DAMAGE_BONUS,
			CharacteristicEnum.CRITICAL_DAMAGE_REDUCTION,
			CharacteristicEnum.CRITICAL_HIT,
			CharacteristicEnum.INITIATIVE,
			CharacteristicEnum.GLYPH_POWER,
			CharacteristicEnum.RUNE_POWER,
			CharacteristicEnum.PERMANENT_DAMAGE_PERCENT,
			CharacteristicEnum.HEAL_BONUS,
			CharacteristicEnum.NEUTRAL_DAMAGE_BONUS,
			CharacteristicEnum.NEUTRAL_ELEMENT_REDUCTION,
			CharacteristicEnum.NEUTRAL_ELEMENT_RESIST_PERCENT,
			CharacteristicEnum.PUSH_DAMAGE_BONUS,
			CharacteristicEnum.PUSH_DAMAGE_REDUCTION,
			CharacteristicEnum.RANGE,
			CharacteristicEnum.REFLECT,
			CharacteristicEnum.TRAP_BONUS,
			CharacteristicEnum.TRAP_BONUS_PERCENT,
			CharacteristicEnum.VITALITY,
			CharacteristicEnum.WISDOM,
			CharacteristicEnum.MELEE_DAMAGE_DONE_PERCENT,
			CharacteristicEnum.MELEE_DAMAGE_RECEIVED_PERCENT,
			CharacteristicEnum.RANGED_DAMAGE_DONE_PERCENT,
			CharacteristicEnum.RANGED_DAMAGE_RECEIVED_PERCENT,
			CharacteristicEnum.SPELL_DAMAGE_DONE_PERCENT,
			CharacteristicEnum.SPELL_DAMAGE_RECEIVED_PERCENT,
			CharacteristicEnum.WEAPON_DAMAGE_DONE_PERCENT,
			CharacteristicEnum.WEAPON_DAMAGE_RECEIVED_PERCENT,
			CharacteristicEnum.WEAPON_DAMAGES_BONUS_PERCENT,
			CharacteristicEnum.WEIGHT,
		]

		const resistanceCharacteristics = [
			CharacteristicEnum.AIR_ELEMENT_RESIST_PERCENT,
			CharacteristicEnum.EARTH_ELEMENT_RESIST_PERCENT,
			CharacteristicEnum.FIRE_ELEMENT_RESIST_PERCENT,
			CharacteristicEnum.WATER_ELEMENT_RESIST_PERCENT,
		]

		const dodgeCharacteristics = [
			CharacteristicEnum.DODGE_PALOST_PROBABILITY,
			CharacteristicEnum.DODGE_PMLOST_PROBABILITY,
		]

		const relativeCharacteristics = [
			CharacteristicEnum.PAATTACK,
			CharacteristicEnum.PMATTACK,
			CharacteristicEnum.TACKLE_BLOCK,
			CharacteristicEnum.TACKLE_EVADE,
			CharacteristicEnum.PROSPECTING,
		]

		commonCharacteristics.forEach((charEnum) => {
			stats.setCharacteristic(charEnum, Characteristic.zero())
		})

		resistanceCharacteristics.forEach((charEnum) => {
			stats.setCharacteristic(charEnum, ResistanceCharacteristic.zero())
		})

		dodgeCharacteristics.forEach((charEnum) => {
			stats.setCharacteristic(charEnum, PointDodgeCharacteristic.zero())
		})

		relativeCharacteristics.forEach((charEnum) => {
			if (charEnum === CharacteristicEnum.PROSPECTING) {
				stats.setCharacteristic(
					charEnum,
					RelativeCharacteristic.new(BreedManager._breedDefaultProspection)
				)
			}

			stats.setCharacteristic(charEnum, PointDodgeCharacteristic.zero())
		})

		stats.setCharacteristic(
			CharacteristicEnum.STATS_POINTS,
			new Characteristic(5)
		)

		stats.setCharacteristic(
			CharacteristicEnum.ACTION_POINTS,
			ApCharacteristic.new(ConfigurationManager.getInstance().startAp)
		)
		stats.setCharacteristic(
			CharacteristicEnum.MOVEMENT_POINTS,
			MpCharacteristic.new(ConfigurationManager.getInstance().startMp)
		)

		stats.setCharacteristic(
			CharacteristicEnum.RANGE,
			RangeCharacteristic.zero()
		)

		stats.setCharacteristic(
			CharacteristicEnum.SUMMONABLE_CREATURES_BOOST,
			new Characteristic(this._baseSummonsLimit)
		)
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
			totalWeight: this.currentMaxWeight,
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
			let keyAsString =
				CharacteristicEnum[key as keyof typeof CharacteristicEnum]
			stats.setCharacteristic(
				keyAsString,
				new Characteristic(
					characteristic.base,
					characteristic.additional,
					characteristic.objects,
					characteristic.context
				)
			)
		}

		stats._missingLifePoints = json.missingLifePoints
		stats._lifePercentage = json.lifePercentage
		stats._strength = json.strength
		stats._vitality = json.vitality
		stats._wisdom = json.wisdom
		stats._chance = json.chance
		stats._agility = json.agility
		stats._intelligence = json.intelligence
		stats._currentMaxWeight = json.totalWeight
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

	public set missingLifePoints(missingLifePoints: number) {
		this._missingLifePoints = missingLifePoints
	}

	public get lifePercentage(): number {
		return this._lifePercentage
	}

	public set lifePercentage(lifePercentage: number) {
		this._lifePercentage = lifePercentage
	}

	public get currentMaxWeight(): number {
		return this._currentMaxWeight
	}

	public set currentMaxWeight(currentMaxWeight: number) {
		this._currentMaxWeight = currentMaxWeight
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

		const spellModifiers: SpellModifierMessage[] = []

		const stats = new CharacterCharacteristicsInformations(
			character.experience,
			Experience.getCharacterExperienceLevelFloor(character.level),
			Experience.getCharacterExperienceNextLevelFloor(character.level),
			0,
			character.kamas,
			alignementInfos,
			this.getCharacterCharacteristic(),
			0,
			spellModifiers,
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

		this.characteristics.forEach(
			(value: Characteristic, key: CharacteristicEnum) => {
				if (selected === null || selected.includes(key)) {
					result.set(key, value.characterCharacteristicDetailed(key))
				}
			}
		)

		const staticCharacteristics: [CharacteristicEnum, number][] = [
			[CharacteristicEnum.LIFE_POINTS, this.lifePoints],
			[CharacteristicEnum.MAX_LIFE_POINTS, this.maxLifePoints],
			[CharacteristicEnum.MAX_ENERGY_POINTS, this.maxEnergyPoints],
			[CharacteristicEnum.ENERGY_POINTS, this.energy],
		]

		staticCharacteristics.forEach(([enumVal, value]) => {
			result.set(enumVal, new CharacterCharacteristicValue(enumVal, value))
		})

		return Array.from(result.values())
	}

	// public static new(level: number): EntityStats {
	// 	let stats = new EntityStats(
	// 		BreedManager._breedDefaultLife,
	// 		BreedManager._breedDefaultLife,
	// 		level * 100,
	// 		level * 100,
	// 		0
	// 	)

	//   const commonCharacteristics = [
	//     CharacteristicEnum.AGILITY,
	//     CharacteristicEnum.AIR_DAMAGE_BONUS,
	//     CharacteristicEnum.AIR_ELEMENT_REDUCTION,
	//     CharacteristicEnum.CHANCE,
	//     CharacteristicEnum.WATER_DAMAGE_BONUS,
	//     CharacteristicEnum.WATER_ELEMENT_REDUCTION,
	//     CharacteristicEnum.INTELLIGENCE,
	//     CharacteristicEnum.FIRE_DAMAGE_BONUS,
	//     CharacteristicEnum.FIRE_ELEMENT_REDUCTION,
	//     CharacteristicEnum.STRENGTH,
	//     CharacteristicEnum.EARTH_DAMAGE_BONUS,
	//     CharacteristicEnum.EARTH_ELEMENT_REDUCTION,
	//     CharacteristicEnum.ALL_DAMAGES_BONUS,
	//     CharacteristicEnum.DAMAGES_BONUS_PERCENT,
	//     CharacteristicEnum.CRITICAL_DAMAGE_BONUS,
	//     CharacteristicEnum.CRITICAL_DAMAGE_REDUCTION,
	//     CharacteristicEnum.CRITICAL_HIT,
	//     CharacteristicEnum.INITIATIVE,
	//     CharacteristicEnum.GLYPH_POWER,
	//     CharacteristicEnum.RUNE_POWER,
	//     CharacteristicEnum.PERMANENT_DAMAGE_PERCENT,
	//     CharacteristicEnum.HEAL_BONUS,
	//     CharacteristicEnum.NEUTRAL_DAMAGE_BONUS,
	//     CharacteristicEnum.NEUTRAL_ELEMENT_REDUCTION,
	//     CharacteristicEnum.NEUTRAL_ELEMENT_RESIST_PERCENT,
	//     CharacteristicEnum.PUSH_DAMAGE_BONUS,
	//     CharacteristicEnum.PUSH_DAMAGE_REDUCTION,
	//     CharacteristicEnum.RANGE,
	//     CharacteristicEnum.REFLECT,
	//     CharacteristicEnum.TRAP_BONUS,
	//     CharacteristicEnum.TRAP_BONUS_PERCENT,
	//     CharacteristicEnum.VITALITY,
	//     CharacteristicEnum.WISDOM,
	//     CharacteristicEnum.MELEE_DAMAGE_DONE_PERCENT,
	//     CharacteristicEnum.MELEE_DAMAGE_RECEIVED_PERCENT,
	//     CharacteristicEnum.RANGED_DAMAGE_DONE_PERCENT,
	//     CharacteristicEnum.RANGED_DAMAGE_RECEIVED_PERCENT,
	//     CharacteristicEnum.SPELL_DAMAGE_DONE_PERCENT,
	//     CharacteristicEnum.SPELL_DAMAGE_RECEIVED_PERCENT,
	//     CharacteristicEnum.WEAPON_DAMAGE_DONE_PERCENT,
	//     CharacteristicEnum.WEAPON_DAMAGE_RECEIVED_PERCENT,
	//     CharacteristicEnum.WEAPON_DAMAGES_BONUS_PERCENT,
	//     CharacteristicEnum.WEIGHT,
	// ];

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.STATS_POINTS,
	// 		new Characteristic(5)
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.ACTION_POINTS,
	// 		ApCharacteristic.new(ConfigurationManager.getInstance().startAp)
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.MOVEMENT_POINTS,
	// 		MpCharacteristic.new(ConfigurationManager.getInstance().startMp)
	// 	)
	// 	stats.setCharacteristic(CharacteristicEnum.AGILITY, Characteristic.zero())
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.AIR_DAMAGE_BONUS,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.AIR_ELEMENT_REDUCTION,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.AIR_ELEMENT_RESIST_PERCENT,
	// 		ResistanceCharacteristic.zero()
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.ALL_DAMAGES_BONUS,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.DAMAGES_BONUS_PERCENT,
	// 		Characteristic.zero()
	// 	)

	// 	stats.setCharacteristic(CharacteristicEnum.CHANCE, Characteristic.zero())
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.CRITICAL_DAMAGE_BONUS,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.CRITICAL_DAMAGE_REDUCTION,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.CRITICAL_HIT,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.INITIATIVE,
	// 		Characteristic.zero()
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.DODGE_PALOST_PROBABILITY,
	// 		PointDodgeCharacteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.DODGE_PMLOST_PROBABILITY,
	// 		PointDodgeCharacteristic.zero()
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.EARTH_DAMAGE_BONUS,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.EARTH_ELEMENT_REDUCTION,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.EARTH_ELEMENT_RESIST_PERCENT,
	// 		ResistanceCharacteristic.zero()
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.FIRE_DAMAGE_BONUS,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.FIRE_ELEMENT_REDUCTION,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.FIRE_ELEMENT_RESIST_PERCENT,
	// 		ResistanceCharacteristic.zero()
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.GLYPH_POWER,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.RUNE_POWER,
	// 		Characteristic.zero()
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.PERMANENT_DAMAGE_PERCENT,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.HEAL_BONUS,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.INTELLIGENCE,
	// 		Characteristic.zero()
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.NEUTRAL_DAMAGE_BONUS,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.NEUTRAL_ELEMENT_REDUCTION,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.NEUTRAL_ELEMENT_RESIST_PERCENT,
	// 		Characteristic.zero()
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.PROSPECTING,
	// 		RelativeCharacteristic.new(BreedManager._breedDefaultProspection)
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.PUSH_DAMAGE_BONUS,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.PUSH_DAMAGE_REDUCTION,
	// 		Characteristic.zero()
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.RANGE,
	// 		RangeCharacteristic.zero()
	// 	)
	// 	stats.setCharacteristic(CharacteristicEnum.REFLECT, Characteristic.zero())

	// 	stats.setCharacteristic(CharacteristicEnum.STRENGTH, Characteristic.zero())

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.SUMMONABLE_CREATURES_BOOST,
	// 		new Characteristic(this._baseSummonsLimit)
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.TRAP_BONUS,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.TRAP_BONUS_PERCENT,
	// 		Characteristic.zero()
	// 	)

	// 	stats.setCharacteristic(CharacteristicEnum.VITALITY, Characteristic.zero())

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.WATER_DAMAGE_BONUS,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.WATER_ELEMENT_REDUCTION,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.WATER_ELEMENT_RESIST_PERCENT,
	// 		ResistanceCharacteristic.zero()
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.WEAPON_DAMAGES_BONUS_PERCENT,
	// 		Characteristic.zero()
	// 	)

	// 	stats.setCharacteristic(CharacteristicEnum.WISDOM, Characteristic.zero())

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.TACKLE_BLOCK,
	// 		RelativeCharacteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.TACKLE_EVADE,
	// 		RelativeCharacteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.PAATTACK,
	// 		RelativeCharacteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.PMATTACK,
	// 		RelativeCharacteristic.zero()
	// 	)

	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.MELEE_DAMAGE_DONE_PERCENT,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.MELEE_DAMAGE_RECEIVED_PERCENT,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.RANGED_DAMAGE_DONE_PERCENT,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.RANGED_DAMAGE_RECEIVED_PERCENT,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.SPELL_DAMAGE_DONE_PERCENT,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.SPELL_DAMAGE_RECEIVED_PERCENT,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.WEAPON_DAMAGE_DONE_PERCENT,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(
	// 		CharacteristicEnum.WEAPON_DAMAGE_RECEIVED_PERCENT,
	// 		Characteristic.zero()
	// 	)
	// 	stats.setCharacteristic(CharacteristicEnum.WEIGHT, Characteristic.zero())
	// 	stats.initialize()

	// 	return stats
	// }

	// public getCharacterCharacteristic(
	// 	selected: CharacteristicEnum[] | null = null
	// ): CharacterCharacteristic[] {
	// 	let result: Map<CharacteristicEnum, CharacterCharacteristic> = new Map<
	// 		CharacteristicEnum,
	// 		CharacterCharacteristic
	// 	>()

	// 	if (selected == null) {
	// 		this.characteristics.forEach(
	// 			(value: Characteristic, key: CharacteristicEnum) => {
	// 				result.set(key, value.characterCharacteristicDetailed(key))
	// 			}
	// 		)
	// 	} else {
	// 		let characteristics = this._characteristics.keys()

	// 		for (let i = 0; i < selected.length; i++) {
	// 			if (characteristics.next().value == selected[i]) {
	// 				result.set(
	// 					selected[i],
	// 					this._characteristics
	// 						.get(selected[i])
	// 						?.characterCharacteristicDetailed(
	// 							selected[i]
	// 						) as CharacterCharacteristic
	// 				)
	// 			}
	// 		}

	// 		return Array.from(result.values())
	// 	}

	// 	const lifePointEnum = CharacteristicEnum.LIFE_POINTS
	// 	const maxLifePointEnum = CharacteristicEnum.MAX_LIFE_POINTS
	// 	const maxEnergyPointEnum = CharacteristicEnum.MAX_ENERGY_POINTS
	// 	const energyPointEnum = CharacteristicEnum.ENERGY_POINTS

	// 	const lifePoint = this.lifePoints
	// 	const maxLifePoint = this.maxLifePoints
	// 	const maxEnergyPoint = this.maxEnergyPoints
	// 	const energyPoint = this.energy

	// 	result.set(
	// 		lifePointEnum,
	// 		new CharacterCharacteristicValue(lifePointEnum, lifePoint)
	// 	)
	// 	result.set(
	// 		maxLifePointEnum,
	// 		new CharacterCharacteristicValue(maxLifePointEnum, maxLifePoint)
	// 	)
	// 	result.set(
	// 		maxEnergyPointEnum,
	// 		new CharacterCharacteristicValue(maxEnergyPointEnum, maxEnergyPoint)
	// 	)
	// 	result.set(
	// 		energyPointEnum,
	// 		new CharacterCharacteristicValue(energyPointEnum, energyPoint)
	// 	)

	// 	return Array.from(result.values())
	// }
}

export default EntityStats
