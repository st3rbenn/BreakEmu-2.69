import { StatsBoostEnum } from "../../breakEmu_Server/IO"

interface StatUpgradeCost {
	cost: number
	until: number
}

class Breed {
	private _id: number
	private _name: string
	private _maleLook: string
	private _femaleLook: string
	private _maleColors: number[]
	private _femaleColors: number[]
	private _spForIntelligence: { cost: number; until: number }[]
	private _spForAgility: { cost: number; until: number }[]
	private _spForStrength: { cost: number; until: number }[]
	private _spForVitality: { cost: number; until: number }[]
	private _spForWisdom: { cost: number; until: number }[]
	private _spForChance: { cost: number; until: number }[]
	private _startLifePoints: number
	private _breedSpells: number[] = []

	private static _Breeds: Breed[] = []

	constructor(
		id: number,
		name: string,
		maleLook: string,
		femaleLook: string,
		maleColors: string,
		femaleColors: string,
		spForIntelligence: StatUpgradeCost[],
		spForAgility: StatUpgradeCost[],
		spForStrength: StatUpgradeCost[],
		spForVitality: StatUpgradeCost[],
		spForWisdom: StatUpgradeCost[],
		spForChance: StatUpgradeCost[],
		startLifePoints: number,
		breedSpellsId: string
	) {
		this._id = id
		this._name = name
		this._maleLook = maleLook
		this._femaleLook = femaleLook
		this._maleColors = maleColors.split(",").map(Number)
		this._femaleColors = femaleColors.split(",").map(Number)
		this._spForIntelligence = spForIntelligence
		this._spForAgility = spForAgility
		this._spForStrength = spForStrength
		this._spForVitality = spForVitality
		this._spForWisdom = spForWisdom
		this._spForChance = spForChance
		this._startLifePoints = startLifePoints
		this._breedSpells = breedSpellsId.split(",").map(Number)
	}

	public get id(): number {
		return this._id
	}

	public get name(): string {
		return this._name
	}

	public get maleLook(): string {
		return this._maleLook
	}

	public get femaleLook(): string {
		return this._femaleLook
	}

	public get maleColors(): number[] {
		return this._maleColors
	}

	public get femaleColors(): number[] {
		return this._femaleColors
	}

	public get spForIntelligence(): { cost: number; until: number }[] {
		return this._spForIntelligence
	}

	public get spForAgility(): { cost: number; until: number }[] {
		return this._spForAgility
	}

	public get spForStrength(): { cost: number; until: number }[] {
		return this._spForStrength
	}

	public get spForVitality(): { cost: number; until: number }[] {
		return this._spForVitality
	}

	public get spForWisdom(): { cost: number; until: number }[] {
		return this._spForWisdom
	}

	public get spForChance(): { cost: number; until: number }[] {
		return this._spForChance
	}

	public get startLifePoints(): number {
		return this._startLifePoints
	}

	public get breedSpells(): number[] {
		return this._breedSpells
	}

	public set breedSpells(breedSpells: number[]) {
		this._breedSpells = breedSpells
	}

	public getStatUpgradeCost(statId: StatsBoostEnum): StatUpgradeCost[] {
		switch (statId) {
			case StatsBoostEnum.STRENGTH:
				return this.spForStrength
			case StatsBoostEnum.VITALITY:
				return this.spForVitality
			case StatsBoostEnum.WISDOM:
				return this.spForWisdom
			case StatsBoostEnum.CHANCE:
				return this.spForChance
			case StatsBoostEnum.AGILITY:
				return this.spForAgility
			case StatsBoostEnum.INTELLIGENCE:
				return this.spForIntelligence
		}
	}

	public getStatUpgradeCostIndex(
		actualPoints: number,
		costs: StatUpgradeCost[]
	): number {
		let index = 0
		for(let i = 0; i < costs.length; i++) {
      console.log(costs[i])
      if(costs[i].until <= actualPoints) {
        index = i
        return index
      }
    }
    index = costs.length - 1
    return index
	}

	public static get breeds(): Breed[] {
		return Breed._Breeds
	}

	public static set breeds(breeds: Breed[]) {
		Breed._Breeds = breeds
	}

	public static statsPointParser(statsPoint: string): StatUpgradeCost[] {
		const statsPoints = statsPoint.split("|")
		const sp: StatUpgradeCost[] = []
		for (const sps of statsPoints) {
			const res = sps.split(",")
			if (res[0].length >= 1) {
				const until = parseInt(res[0])
				const cost = parseInt(res[1])
				const stat = { cost, until }
				sp.push(stat)
			}
		}

		return sp
	}
}

export default Breed
