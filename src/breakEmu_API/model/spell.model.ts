import SpellLevel from "./spellLevel.model"
import CharacterSpell from "../../breakEmu_World/manager/spell/CharacterSpell"
import Character from "./character.model"

class Spell {
	id: number
	name: string
	description: string
	spellLevels: number[] = []
	verbose: boolean
	variant: Spell | null = null
	_minimumLevel: number = 1
	levels: Map<number, SpellLevel> = new Map<number, SpellLevel>()

	private static _spells: Map<number, Spell> = new Map<number, Spell>()

	constructor(id: number, name: string, description: string, verbose: boolean) {
		this.id = id
		this.name = name
		this.description = description
		this.verbose = verbose
	}

	public addVariant(spell: Spell): void {
		this.variant = spell
	}

	public setMinimumLevel(minimumLevel: number): void {
		this._minimumLevel = minimumLevel
	}

	public get minimumLevel(): number {
		return this.getMinimumLevel()
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

	public getMinimumLevel(): number {
		let lowest = null
		let lowestKey = null

		for (let [key, value] of this.levels) {
			if (lowest === null || value.minPlayerLevel < lowest) {
				lowest = value.minPlayerLevel
				lowestKey = key
			}
		}

		return lowest as number
	}

	public getLevelByGrade(grade: number): SpellLevel | undefined {
    return grade === 0 ? this.getLastLevel() : grade <= this.levels.size ? Array.from(this.levels.values())[grade - 1] : this.getLastLevel()
	}

	public getLastLevel(): SpellLevel | undefined {
		return this.levels.get(this.levels.size)
	}

	public static loadFromJson(
		json: any,
		character: Character
	): Map<number, CharacterSpell> {
		const spells: Map<number, CharacterSpell> = new Map<
			number,
			CharacterSpell
		>()

		for (const sp of json) {
			const spell = Spell.getSpellById(sp.spellId)
			if (spell) {
				spells.set(
					sp.spellId,
					new CharacterSpell(sp.spellId, sp.variant, character)
				)
			}
		}

		return spells
	}
}

export default Spell
