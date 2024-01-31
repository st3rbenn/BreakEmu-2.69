import { SpellItem } from "../../../../breakEmu_Server/IO"
import Character from "../../../../breakEmu_API/model/character.model"
import Spell from "../../../../breakEmu_API/model/spell.model"
import SpellLevel from "../../../../breakEmu_API/model/spellLevel.model"

class CharacterSpell {
	private _spell: Spell | null = null
	private _spellId: number
	private _variant: boolean

  private _character: Character

	constructor(spellId: number, variant: boolean = false, character: Character) {
		this._spellId = spellId
		this._variant = variant
		this._spell = Spell.getSpellById(spellId) as Spell
    this._character = character
	}

	public get spellId(): number {
		return this._spellId
	}

	public set spellId(spellId: number) {
		this._spellId = spellId
	}

	public get variant(): boolean {
		return this._variant
	}

	public set variant(variant: boolean) {
		this._variant = variant
	}

	public get spell(): Spell | null {
		return this._spell
	}

	public set spell(spell: Spell) {
		this._spell = spell
	}

	public get baseSpell(): Spell {
		if (this.spell == null) {
			this.spell = Spell.getSpellById(this.spellId) as Spell
			return this.spell
		} else {
			return this.spell
		}
	}

	public learned() {
		return (
    (this.baseSpell?.getMinimumLevel() as number) <=
			this._character.level
		)
	}

	public variantSpell(): Spell {
		return this.variant ? this.baseSpell : (this.baseSpell.variant as Spell)
	}

	public activeSpell(): Spell {
		return this.variant ? (this.baseSpell.variant as Spell) : this.baseSpell
	}

	public getGrade(character: Character) {
		let index = 0

		for (let i = 0; i < this.baseSpell.spellLevels.length; i++) {
			const spellLevel = this.baseSpell.levels.get(i) as SpellLevel
			if (spellLevel.minPlayerLevel <= character.level) {
				index = spellLevel.grade
			} else {
				break
			}
		}

		return index
	}

	public getSpellItem(character: Character) {
		return new SpellItem(
			this.variant ? (this.baseSpell.variant?.id as number) : this.baseSpell.id,
			this.spell?.getLevelByGrade(this.getGrade(character))?.minPlayerLevel as number + 1
		)
	}

  public saveAsJson() {
    return {
      spellId: this.spellId,
      variant: this.variant
    }
  }
}

export default CharacterSpell
