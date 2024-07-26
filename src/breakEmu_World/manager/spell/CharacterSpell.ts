import { SpellItem } from "../../../breakEmu_Server/IO"
import Character from "../../../breakEmu_API/model/character.model"
import Spell from "../../../breakEmu_API/model/spell.model"
import SpellLevel from "../../../breakEmu_API/model/spellLevel.model"

class CharacterSpell {
	private spell: Spell | null = null
	private spellId: number
	private variant: boolean

	private character: Character

	public selected: boolean = false

	constructor(spellId: number, variant: boolean = false, character: Character) {
		this.spellId = spellId
		this.variant = variant
		this.spell = Spell.getSpellById(spellId) as Spell
		this.character = character

		this.selected = false
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
		return this.baseSpell?.getMinimumLevel() <= this.character.level
	}

	public variantSpell(): Spell {
		return this.variant ? this.baseSpell : (this.baseSpell.variant as Spell)
	}

	public activeSpell(): Spell {
		return this.variant ? (this.baseSpell.variant as Spell) : this.baseSpell
	}

	public getGrade() {
		let index = 0

		for (let i = 0; i < this.baseSpell.spellLevels.length; i++) {
			const spellLevel = this.baseSpell.levels.get(i) as SpellLevel
			if (spellLevel.minPlayerLevel <= this.character.level) {
				index = spellLevel.grade
			} else {
				break
			}
		}

		return index + 1
	}

	public getSpellItem(): SpellItem {
		const spellLevel = this.spell?.getLevelByGrade(this.getGrade())
			?.minPlayerLevel as number

		const spellItem = new SpellItem(
			this.variant ? (this.baseSpell.variant?.id as number) : this.baseSpell.id,
			this.selected ? spellLevel : 0,
		)

		if (spellItem.spellLevel == 0) {
			spellItem.spellLevel = 1
		}

		return spellItem
	}

	public saveAsJson() {
		return {
			spellId: this.spellId,
			variant: this.variant,
		}
	}
}

export default CharacterSpell
