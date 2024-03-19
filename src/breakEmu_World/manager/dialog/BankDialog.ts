import WorldClient from "breakEmu_World/WorldClient"
import BankItem from "../../../breakEmu_API/model/BankItem.model"
import Character from "../../../breakEmu_API/model/character.model"
import Logger from "../../../breakEmu_Core/Logger"
import {
  DialogTypeEnum,
  ExchangeStartedWithStorageMessage,
  ExchangeTypeEnum,
  ObjectItem,
  StorageInventoryContentMessage,
} from "../../../breakEmu_Server/IO"
import DialogHandler from "../../../breakEmu_World/handlers/dialog/DialogHandler"
import Dialog from "./Dialog"

class BankDialog extends Dialog {
	logger: Logger = new Logger("BankDialog")
	character: Character
	bankItems: Map<number, BankItem>
	private static maxStorageSlots: number = 300

	constructor(character: Character) {
		super()
		this.character = character
		this.bankItems = character.bank.items
	}

	override async open(): Promise<void> {
		try {
			const allItems = Array.from(this.bankItems.values())

			const objects: ObjectItem[] = []
			for (const item of allItems) {
				const i = await item.getObjectItem()
				objects.push(i)
			}

			await this.character.client?.Send(
				new ExchangeStartedWithStorageMessage(
          23,
          BankDialog.maxStorageSlots
        )
			)
			await this.character.client?.Send(
        new StorageInventoryContentMessage(objects, 0)
			)

      this.character.reply("You have " + objects.length + " items in your bank.")
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	override async close(): Promise<void> {
		try {
			await DialogHandler.leaveDialogMessage(
				this.character.client as WorldClient,
				DialogTypeEnum.DIALOG_EXCHANGE
			)
		} catch (error) {
			this.logger.error(error as any)
		}
	}
}

export default BankDialog
