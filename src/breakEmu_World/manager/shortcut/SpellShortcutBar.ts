import Character from "@breakEmu_API/model/character.model"
import {
	ShortcutBarEnum,
	ShortcutBarRemovedMessage,
} from "@breakEmu_Protocol/IO"
import ShortcutBar from "./ShortcutBar"
import CharacterShortcut from "./character/CharacterShortcut"
import CharacterSpellShortcut from "./character/characterSpellShortcut"

class SpellShortcutBar extends ShortcutBar {
	public barEnum: ShortcutBarEnum = ShortcutBarEnum.SPELL_SHORTCUT_BAR

	constructor(character: Character) {
		super(character)
	}

	public async removeShortcut(slotId: number): Promise<void> {
		try {
			const shortcut = this.getShortcut(slotId)

			if (shortcut) {
				// Supprimer le raccourci de la barre de raccourcis locale
				this.shortcuts.delete(slotId)

				// Supprimer le raccourci de la barre de raccourcis du personnage
				// Assurez-vous que shortcut.slotId est bien l'identifiant correct à utiliser ici
				this.character.shortcuts.delete(shortcut.slotId)

				// Envoyer une notification de suppression au serveur
				if (this.character.client) {
					const message = new ShortcutBarRemovedMessage(this.barEnum, slotId)
					await this.character.client.Send(message)
				}
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async add(spellId: number): Promise<void> {
		try {
			const slotId = this.getFreeSlotId()
			let shortcut: CharacterSpellShortcut | undefined
			if (slotId) {
				shortcut = new CharacterSpellShortcut(slotId, spellId, this.barEnum)
				await this.addShortcut(shortcut)
			}

			await this.refreshShortcut(shortcut)
		} catch (error) {
			console.log(error)
		}
	}

	public async addShortcut(
		shortcut: CharacterShortcut | undefined
	): Promise<void> {
		try {
			// Vérifier si on peut ajouter un raccourci
			if (!this.canAdd()) {
				return
			}

			// Vérifier si le raccourci n'est pas undefined
			if (!shortcut) {
				return
			}

			// Vérifier si un raccourci existe déjà à cet emplacement
			const existingShortcut = this.getShortcut(shortcut.slotId)
			if (existingShortcut) {
				await this.removeShortcut(shortcut.slotId)
			}

			// Ajouter le nouveau raccourci à la barre de raccourcis
			// this.character.shortcuts.set(shortcut.slotId, shortcut);
			this.shortcuts.set(shortcut.slotId, shortcut)

			// Rafraîchir l'état du raccourci
			await this.refreshShortcut(shortcut)
		} catch (error) {
			console.log(error)
		}
	}

	public async updateVariantShortcut(
		spellId: number,
		variantSpellId: number
	): Promise<void> {
		const shortcuts = this.getShortcuts(spellId)

		for (const shortcut of shortcuts) {
			shortcut.spellId = variantSpellId
			await super.refreshShortcut(shortcut)
		}
	}

	public initialize(): Map<number, CharacterShortcut | undefined> {
		for (const shortcut of this.character.shortcuts.values()) {
			if (shortcut instanceof CharacterSpellShortcut) {
				this.addShortcut(shortcut)
			}
		}

		return this.shortcuts
	}

	public async swap(firstSlot: number, secondSlot: number): Promise<void> {
		const firstShortcut = this.getShortcut(firstSlot)
		const secondShortcut = this.getShortcut(secondSlot)

		// Mise à jour des _slotId et échange des raccourcis dans le Map
		if (firstShortcut !== undefined) {
			firstShortcut.slotId = secondSlot
			this.shortcuts.set(secondSlot, firstShortcut)
		} else {
			// Si le premier raccourci est null, définir explicitement le second slot à null
			this.shortcuts.set(secondSlot, undefined)
		}

		if (secondShortcut !== undefined) {
			secondShortcut.slotId = firstSlot
			this.shortcuts.set(firstSlot, secondShortcut)
		} else {
			// Si le second raccourci est null, définir explicitement le premier slot à null
			this.shortcuts.set(firstSlot, undefined)
		}

		await this.refresh()
		return Promise.resolve()
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
