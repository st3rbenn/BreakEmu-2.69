import SpellLevel from "./spellLevel.model"

class Spell {
	private _id: number
	private _name: string
	private _description: string
	private _spellLevels: number[] = []
	private _verbose: boolean
	private _variant: Spell | null = null
	private _minimumLevel: number = 1
	private _levels: Map<number, SpellLevel> = new Map<number, SpellLevel>()

	private static _spells: Map<number, Spell> = new Map<number, Spell>()

	constructor(
		id: number,
		name: string,
		description: string,
		verbose: boolean,
	) {
		this._id = id
		this._name = name
		this._description = description
		this._verbose = verbose
	}

	public get levels(): Map<number, SpellLevel> {
		return this._levels
	}

	public set levels(levels: Map<number, SpellLevel>) {
		this._levels = levels
	}

	public get id(): number {
		return this._id
	}

	public set id(id: number) {
		this._id = id
	}

	public get name(): string {
		return this._name
	}

	public set name(name: string) {
		this._name = name
	}

	public get description(): string {
		return this._description
	}

	public set description(description: string) {
		this._description = description
	}

	public get spellLevels(): number[] {
		return this._spellLevels
	}

	public set spellLevels(spellLevels: number[]) {
		this._spellLevels = spellLevels
	}

	public get verbose(): boolean {
		return this._verbose
	}

	public set verbose(verbose: boolean) {
		this._verbose = verbose
	}

	public get variant(): Spell | null {
		return this._variant
	}

	public set variant(variant: Spell) {
		this._variant = variant
	}

  public get minimumLevel(): number {
    return this._minimumLevel
  }

  public setMinimumLevel(minimumLevel: number): void {
    this._minimumLevel = minimumLevel
  }

  public static get getSpells(): Map<number, Spell> {
    return this._spells
  }

  public static addSpell(spell: Spell): void {
    this._spells.set(spell.id, spell)
  }

	public static getSpellById(id: number): Spell | undefined {
		return this._spells.get(id)
	}

	public getLevelByGrade(grade: number): SpellLevel | undefined {
		if (grade == 0) {
			return this.levels.get(1)
		}
		if (grade <= this.levels.size) {
			return this.levels.get(grade - 1)
		} else {
			return this.levels.get(this.levels.size)
		}
	}

  public static loadFromJson(json: any): void {
    const spells: Spell[] = []
  }
}

export default Spell
