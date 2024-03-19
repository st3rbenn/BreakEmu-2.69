class SpellLevel {
	id: number
	spellId: number
	spellBreed: number
	grade: number
	minPlayerLevel: number
	apCost: number
	minRange: number
	maxRange: number
	castInLine: boolean
	castInDiagonal: boolean
	castTestLos: boolean
	criticalHitProbability: number
	needFreeCell: boolean
	needTakenCell: boolean
	needFreeTrapCell: boolean
	maxStack: number
	maxCastPerTurn: number
	maxCastPerTarget: number
	minCastInterval: number
	initialCooldown: number
	globalCooldown: number
	hideEffects: boolean
	hidden: boolean

	constructor(
		id: number,
		spellId: number,
		spellBreed: number,
		grade: number,
		minPlayerLevel: number,
		apCost: number,
		minRange: number,
		maxRange: number,
		castInLine: boolean,
		castInDiagonal: boolean,
		castTestLos: boolean,
		criticalHitProbability: number,
		needFreeCell: boolean,
		needTakenCell: boolean,
		needFreeTrapCell: boolean,
		maxStack: number,
		maxCastPerTurn: number,
		maxCastPerTarget: number,
		minCastInterval: number,
		initialCooldown: number,
		globalCooldown: number,
		hideEffects: boolean,
		hidden: boolean
	) {
		this.id = id
		this.spellId = spellId
		this.spellBreed = spellBreed
		this.grade = grade
		this.minPlayerLevel = minPlayerLevel
		this.apCost = apCost
		this.minRange = minRange
		this.maxRange = maxRange
		this.castInLine = castInLine
		this.castInDiagonal = castInDiagonal
		this.castTestLos = castTestLos
		this.criticalHitProbability = criticalHitProbability
		this.needFreeCell = needFreeCell
		this.needTakenCell = needTakenCell
		this.needFreeTrapCell = needFreeTrapCell
		this.maxStack = maxStack
		this.maxCastPerTurn = maxCastPerTurn
		this.maxCastPerTarget = maxCastPerTarget
		this.minCastInterval = minCastInterval
		this.initialCooldown = initialCooldown
		this.globalCooldown = globalCooldown
		this.hideEffects = hideEffects
		this.hidden = hidden
	}
}

export default SpellLevel
