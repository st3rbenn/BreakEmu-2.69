import { StatsBoostEnum } from "@breakEmu_Protocol/IO"

interface StatUpgradeCost {
	cost: number
	until: number
}

class Breed {
	id: number
	name: string
	maleLook: string
	femaleLook: string
	maleColors: number[]
	femaleColors: number[]
	spForIntelligence: { cost: number; until: number }[]
	spForAgility: { cost: number; until: number }[]
	spForStrength: { cost: number; until: number }[]
	spForVitality: { cost: number; until: number }[]
	spForWisdom: { cost: number; until: number }[]
	spForChance: { cost: number; until: number }[]
	startLifePoints: number
	breedSpells: number[] = []

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
		this.id = id
		this.name = name
		this.maleLook = maleLook
		this.femaleLook = femaleLook
		this.maleColors = maleColors.split(",").map(Number)
		this.femaleColors = femaleColors.split(",").map(Number)
		this.spForIntelligence = spForIntelligence
		this.spForAgility = spForAgility
		this.spForStrength = spForStrength
		this.spForVitality = spForVitality
		this.spForWisdom = spForWisdom
		this.spForChance = spForChance
		this.startLifePoints = startLifePoints
		this.breedSpells = breedSpellsId.split(",").map(Number)
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

  public static learnStartSpells(breedId: number): any {}
}

export default Breed
