import Character from "@breakEmu_API/model/character.model"
import {
	Shortcut,
	ShortcutBarContentMessage,
	ShortcutBarEnum,
	ShortcutBarRefreshMessage,
} from "@breakEmu_Protocol/IO"
import CharacterShortcut from "./character/CharacterShortcut"

abstract class ShortcutBar {
	private _shortcuts: Map<number, CharacterShortcut | undefined> = new Map()

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

		for (let i = 0; i < 100; i++) {
			this._shortcuts.set(i, undefined) // Ou une autre valeur représentant un slot vide
		}

		// console.log(this._shortcuts)

		this._shortcuts = this.initialize()
	}

	public getShortcut(slotId: number): CharacterShortcut | undefined {
		return this.shortcuts.get(slotId)
	}

	public get shortcuts(): Map<number, CharacterShortcut | undefined> {
		return this._shortcuts
	}

	public set shortcuts(shortcuts: Map<number, CharacterShortcut>) {
		this._shortcuts = shortcuts
	}

	public abstract removeShortcut(slotId: number): Promise<void>

	public abstract addShortcut(shortcut: CharacterShortcut): void

	public async refreshShortcut(shortcut: CharacterShortcut | undefined): Promise<void> {
		if (shortcut) {
			await this.character.client?.Send(
				new ShortcutBarRefreshMessage(this.barEnum, shortcut.getShortcut())
			)
		}
	}

	public getFreeSlotId(): number | null {
		for (let i = 0; i < 100; i++) {
			if (this.getShortcut(i) == null) {
				return i
			}
		}

		return null
	}

	public canAdd(): boolean {
		return this.getFreeSlotId() != null
	}

	public async refresh(): Promise<void> {
		let sht: Shortcut[] = []
		for (const shortcut of this._shortcuts.keys()) {
			const sh = this.getShortcut(shortcut)
			if (sh) {
				sht.push(sh.getShortcut())
			}
		}

		await this.character.client?.Send(
			new ShortcutBarContentMessage(this.barEnum, sht)
		)
	}

	public abstract swap(firstSlot: number, secondSlot: number): Promise<void>

	public abstract initialize(): Map<number, CharacterShortcut | undefined>
}

export default ShortcutBar
