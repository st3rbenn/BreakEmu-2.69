import Character from "../../../breakEmu_API/model/character.model"
import {
	ShortcutBarEnum,
	ShortcutBarRemovedMessage,
} from "../../../breakEmu_Server/IO"
import ShortcutBar from "./ShortcutBar"
import CharacterShortcut from "./character/CharacterShortcut"
import CharacterSpellShortcut from "./character/characterSpellShortcut"

class SpellShortcutBar extends ShortcutBar {
	public barEnum: ShortcutBarEnum = ShortcutBarEnum.SPELL_SHORTCUT_BAR

	constructor(character: Character) {
		super(character)
	}

	public async removeShortcut(spellId: number): Promise<void> {
		const shortcuts = this.getShortcuts(spellId)

		for (const shortcut of shortcuts) {
			this.shortcuts.delete(shortcut.slotId)
			this.character.shortcuts.delete(shortcut.slotId)
			this.character.client?.Send(
				this.character.client.serialize(
					new ShortcutBarRemovedMessage(this.barEnum, shortcut.slotId)
				)
			)
		}
	}
	public async add(spellId: number): Promise<void> {
		const slotId = this.getFreeSlotId()

		if (slotId) {
			super.addShortcut(new CharacterSpellShortcut(slotId, spellId, this.barEnum))
		}
	}

  public updateVariantShortcut(spellId: number, variantSpellId: number): void {
    const shortcuts = this.getShortcuts(spellId)

    for (const shortcut of shortcuts) {
      shortcut.spellId = variantSpellId
      super.refreshShortcut(shortcut);
    }
  }
	
	public initialize(): Map<number, CharacterShortcut> {
		const shortcuts = new Map<number, CharacterShortcut>()

		for (const shortcut of this.character.shortcuts.values()) {
			if (shortcut instanceof CharacterSpellShortcut) {
				shortcuts.set(shortcut.slotId, shortcut)
			}
		}

		return shortcuts
	}

	public getShortcuts(spellId: number): CharacterSpellShortcut[] {
		const shortcuts: CharacterSpellShortcut[] = []

		for (const shortcut of this.character.shortcuts.values()) {
			if (
				shortcut instanceof CharacterSpellShortcut &&
				shortcut.spellId === spellId
			) {
				shortcuts.push(shortcut)
			}
		}

		return shortcuts
	}
}

export default SpellShortcutBar
