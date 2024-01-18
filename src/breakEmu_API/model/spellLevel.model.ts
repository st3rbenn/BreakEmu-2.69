class SpellLevel {
	private _id: number
	private _spellId: number
	private _spellBreed: number
	private _grade: number
	private _minPlayerLevel: number
	private _apCost: number
	private _minRange: number
	private _maxRange: number
	private _castInLine: boolean
	private _castInDiagonal: boolean
	private _castTestLos: boolean
	private _criticalHitProbability: number
	private _needFreeCell: boolean
	private _needTakenCell: boolean
	private _needFreeTrapCell: boolean
	private _maxStack: number
	private _maxCastPerTurn: number
	private _maxCastPerTarget: number
	private _minCastInterval: number
	private _initialCooldown: number
	private _globalCooldown: number
	private _hideEffects: boolean
	private _hidden: boolean

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
		this._id = id
		this._spellId = spellId
		this._spellBreed = spellBreed
		this._grade = grade
		this._minPlayerLevel = minPlayerLevel
		this._apCost = apCost
		this._minRange = minRange
		this._maxRange = maxRange
		this._castInLine = castInLine
		this._castInDiagonal = castInDiagonal
		this._castTestLos = castTestLos
		this._criticalHitProbability = criticalHitProbability
		this._needFreeCell = needFreeCell
		this._needTakenCell = needTakenCell
		this._needFreeTrapCell = needFreeTrapCell
		this._maxStack = maxStack
		this._maxCastPerTurn = maxCastPerTurn
		this._maxCastPerTarget = maxCastPerTarget
		this._minCastInterval = minCastInterval
		this._initialCooldown = initialCooldown
		this._globalCooldown = globalCooldown
		this._hideEffects = hideEffects
		this._hidden = hidden
	}

	public get id(): number {
		return this._id
	}

	public set id(id: number) {
		this._id = id
	}

	public get spellId(): number {
		return this._spellId
	}

	public set spellId(spellId: number) {
		this._spellId = spellId
	}

	public get spellBreed(): number {
		return this._spellBreed
	}

	public set spellBreed(spellBreed: number) {
		this._spellBreed = spellBreed
	}

	public get grade(): number {
		return this._grade
	}

	public set grade(grade: number) {
		this._grade = grade
	}

	public get minPlayerLevel(): number {
		return this._minPlayerLevel
	}

	public set minPlayerLevel(minPlayerLevel: number) {
		this._minPlayerLevel = minPlayerLevel
	}

	public get apCost(): number {
		return this._apCost
	}

	public set apCost(apCost: number) {
		this._apCost = apCost
	}

	public get minRange(): number {
		return this._minRange
	}

	public set minRange(minRange: number) {
		this._minRange = minRange
	}

	public get maxRange(): number {
		return this._maxRange
	}

	public set maxRange(maxRange: number) {
		this._maxRange = maxRange
	}

	public get castInLine(): boolean {
		return this._castInLine
	}

	public set castInLine(castInLine: boolean) {
		this._castInLine = castInLine
	}

	public get castInDiagonal(): boolean {
		return this._castInDiagonal
	}

	public set castInDiagonal(castInDiagonal: boolean) {
		this._castInDiagonal = castInDiagonal
	}

	public get castTestLos(): boolean {
		return this._castTestLos
	}

	public set castTestLos(castTestLos: boolean) {
		this._castTestLos = castTestLos
	}

	public get criticalHitProbability(): number {
		return this._criticalHitProbability
	}

	public set criticalHitProbability(criticalHitProbability: number) {
		this._criticalHitProbability = criticalHitProbability
	}

	public get needFreeCell(): boolean {
		return this._needFreeCell
	}

	public set needFreeCell(needFreeCell: boolean) {
		this._needFreeCell = needFreeCell
	}

	public get needTakenCell(): boolean {
		return this._needTakenCell
	}

	public set needTakenCell(needTakenCell: boolean) {
		this._needTakenCell = needTakenCell
	}

	public get needFreeTrapCell(): boolean {
		return this._needFreeTrapCell
	}

	public set needFreeTrapCell(needFreeTrapCell: boolean) {
		this._needFreeTrapCell = needFreeTrapCell
	}

	public get maxStack(): number {
		return this._maxStack
	}

	public set maxStack(maxStack: number) {
		this._maxStack = maxStack
	}

	public get maxCastPerTurn(): number {
		return this._maxCastPerTurn
	}

	public set maxCastPerTurn(maxCastPerTurn: number) {
		this._maxCastPerTurn = maxCastPerTurn
	}

	public get maxCastPerTarget(): number {
		return this._maxCastPerTarget
	}

	public set maxCastPerTarget(maxCastPerTarget: number) {
		this._maxCastPerTarget = maxCastPerTarget
	}

	public get minCastInterval(): number {
		return this._minCastInterval
	}

	public set minCastInterval(minCastInterval: number) {
		this._minCastInterval = minCastInterval
	}

	public get initialCooldown(): number {
		return this._initialCooldown
	}

	public set initialCooldown(initialCooldown: number) {
		this._initialCooldown = initialCooldown
	}

	public get globalCooldown(): number {
		return this._globalCooldown
	}

	public set globalCooldown(globalCooldown: number) {
		this._globalCooldown = globalCooldown
	}

	public get hideEffects(): boolean {
		return this._hideEffects
	}

	public set hideEffects(hideEffects: boolean) {
		this._hideEffects = hideEffects
	}

	public get hidden(): boolean {
		return this._hidden
	}

	public set hidden(hidden: boolean) {
		this._hidden = hidden
	}

	// public static getSpellLevelById(id: number): SpellLevel {
	//   return this.getSpellLevels().get(id)
	// }
}

export default SpellLevel
