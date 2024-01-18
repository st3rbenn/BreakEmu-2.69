import Character from "../../../breakEmu_API/model/character.model"
import { ShortcutBarEnum } from "../../../breakEmu_Server/IO"
import ShortcutBar from "./ShortcutBar"
import CharacterShortcut from "./character/CharacterShortcut"
import CharacterSpellShortcut from "./character/characterSpellShortcut"

class GeneralShortcutBar extends ShortcutBar {
	public barEnum: ShortcutBarEnum = ShortcutBarEnum.GENERAL_SHORTCUT_BAR

	constructor(character: Character) {
		super(character)
	}

	public initialize(): Map<number, CharacterShortcut> {
		const shortcuts = new Map<number, CharacterShortcut>()

		for (const shortcut of this.character.shortcuts.values()) {
			if (!(shortcut instanceof CharacterSpellShortcut)) {
				shortcuts.set(shortcut.slotId, shortcut)
			}
		}

		return shortcuts
	}

	// public async onItemRemove(obj: CharacterItem) {
	// 	const shortcut = await this.getItemShortcut(obj.id)

	// 	if (shortcut) {
	// 		await this.removeShortcut(shortcut.slotId)
	// 	}
	// }

	public async getItemShortcut(itemId: number) {
		return this.shortcuts.get(itemId)
	}
}

export default GeneralShortcutBar
