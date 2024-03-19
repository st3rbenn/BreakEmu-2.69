import Logger from "../../../../breakEmu_Core/Logger"
import {
	ShortcutBarAddRequestMessage,
	ShortcutBarEnum,
	ShortcutBarRemoveRequestMessage,
	ShortcutBarSwapRequestMessage,
	ShortcutObjectItem,
	ShortcutSpell,
} from "../../../../breakEmu_Server/IO"
import CharacterItemShortcut from "../../../../breakEmu_World/manager/shortcut/character/characterItemShortcut"
import WorldClient from "../../../WorldClient"
import ShortcutBar from "../../../manager/shortcut/ShortcutBar"
import CharacterSpellShortcut from "../../../manager/shortcut/character/characterSpellShortcut"

class ShortcutHandler {
	private static logger: Logger = new Logger("ShortcutHandler")

	public static async handleShortcutBarSwapRequestMessage(
		client: WorldClient,
		message: ShortcutBarSwapRequestMessage
	): Promise<void> {
		try {
			const { barType, firstSlot, secondSlot } = message

			if (barType === ShortcutBarEnum.GENERAL_SHORTCUT_BAR) {
				client.selectedCharacter?.generalShortcutBar.swap(
					firstSlot as number,
					secondSlot as number
				)
			} else if (barType === ShortcutBarEnum.SPELL_SHORTCUT_BAR) {
				client.selectedCharacter?.spellShortcutBar.swap(
					firstSlot as number,
					secondSlot as number
				)
			}
		} catch (error) {
			this.logger.error(
				`Error while handling ShortcutBarSwapRequestMessage: ${
					(error as any).message
				}`
			)
		}
	}

	public static async handleShortcutBarAddRequestMessage(
		client: WorldClient,
		message: ShortcutBarAddRequestMessage
	): Promise<void> {
		try {
			const { barType, shortcut } = message

			if (barType === ShortcutBarEnum.GENERAL_SHORTCUT_BAR) {
				const sh = shortcut as ShortcutObjectItem

				const newShortcut = new CharacterItemShortcut(
					sh?.slot as number,
					sh?.itemUID as number,
					sh?.itemGID as number,
					barType
				)

				await client.selectedCharacter?.generalShortcutBar.addShortcut(
					newShortcut
				)
			} else if (barType === ShortcutBarEnum.SPELL_SHORTCUT_BAR) {
				const sh = shortcut as ShortcutSpell

				const characterShortcut = new CharacterSpellShortcut(
					sh.slot as number,
					sh.spellId as number,
					barType
				)

				await client.selectedCharacter?.spellShortcutBar.addShortcut(
					characterShortcut
				)
			}
		} catch (error) {
			this.logger.error(
				`Error while handling ShortcutBarRemoveRequestMessage: ${
					(error as any).message
				}`
			)
		}
	}

	public static async handleShortcutBarRemoveRequestMessage(
		client: WorldClient,
		message: ShortcutBarRemoveRequestMessage
	): Promise<void> {
		try {
			const { barType, slot } = message

			if (barType === ShortcutBarEnum.GENERAL_SHORTCUT_BAR) {
				client.selectedCharacter?.generalShortcutBar?.removeShortcut(
					slot as number
				)
			} else if (barType === ShortcutBarEnum.SPELL_SHORTCUT_BAR) {
				client.selectedCharacter?.spellShortcutBar?.removeShortcut(
					slot as number
				)
			}
		} catch (error) {
			this.logger.error(
				`Error while handling ShortcutBarRemoveRequestMessage: ${
					(error as any).message
				}`
			)
		}
	}
}

export default ShortcutHandler
