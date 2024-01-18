import Character from "../../../breakEmu_API/model/character.model"
import {
	Shortcut,
	ShortcutBarContentMessage,
	ShortcutBarEnum,
	ShortcutBarRefreshMessage,
	ShortcutBarRemovedMessage,
} from "../../../breakEmu_Server/IO"
import CharacterShortcut from "./character/CharacterShortcut"
import CharacterSpellShortcut from "./character/characterSpellShortcut"

abstract class ShortcutBar {
	private _shortcuts: Map<number, CharacterShortcut>

	public abstract barEnum: ShortcutBarEnum
	private _character: Character

	public get character(): Character {
		return this._character
	}

	public set character(character: Character) {
		this._character = character
	}

	constructor(character: Character) {
		this._character = character
		this._shortcuts = this.initialize()
	}

	private getShortcut(slotId: number): CharacterShortcut | undefined {
		return this._shortcuts.get(slotId)
	}

	public get shortcuts(): Map<number, CharacterShortcut> {
		return this._shortcuts
	}

	public set shortcuts(shortcuts: Map<number, CharacterShortcut>) {
		this._shortcuts = shortcuts
	}

	public async removeShortcut(slotId: number): Promise<void> {
		let shortcut = this.getShortcut(slotId)

		if (shortcut) {
			this._shortcuts.delete(slotId)
			this.character.shortcuts.delete(shortcut.slotId)
			await this.character.client?.Send(
				this.character.client.serialize(
					new ShortcutBarRemovedMessage(this.barEnum, slotId)
				)
			)
		}
	}

	public async addShortcut(shortcut: CharacterShortcut): Promise<void> {
		if (!this.canAdd()) {
			return
		}

		let shortct = this.getShortcut(shortcut.slotId)

		if (shortct) {
			await this.removeShortcut(shortcut.slotId)
		}

		this.character.shortcuts.set(shortcut.slotId, shortcut)
		this._shortcuts.set(shortcut.slotId, shortcut)
		this.refreshShortcut(shortcut)
	}

	public refreshShortcut(shortcut: CharacterShortcut): void {
		this.character.client?.Send(
			this.character.client.serialize(
				new ShortcutBarRefreshMessage(this.barEnum, shortcut.getShortcut())
			)
		)
	}

	public async refresh(): Promise<void> {
		let sht: Shortcut[] = []

		for (const shortcut of this._shortcuts.values()) {
			sht.push(shortcut.getShortcut())
		}

		this.character.client?.Send(
			this.character.client?.serialize(
				new ShortcutBarContentMessage(this.barEnum, sht)
			)
		)
	}

	public getFreeSlotId(): number | null {
		for (let i = 0; i < 99; i++) {
			if (this.getShortcut(i) == null) {
				return i
			}
		}

		return null
	}

	public canAdd(): boolean {
		return this.getFreeSlotId() != null
	}

	public abstract initialize(): Map<number, CharacterShortcut>
}

export default ShortcutBar
