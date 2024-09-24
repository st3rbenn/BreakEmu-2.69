import Character from "@breakEmu_API/model/character.model"
import Logger from "@breakEmu_Core/Logger"
import {
	DialogTypeEnum,
	ExchangeStartedWithStorageMessage,
	ExchangeTypeEnum,
	ObjectItem,
	StorageInventoryContentMessage,
} from "@breakEmu_Protocol/IO"
import Exchange from "../exchange/Exchange"
import BankItem from "@breakEmu_API/model/BankItem.model"
import DialogHandler from "@breakEmu_World/handlers/dialog/DialogHandler"
import WorldClient from "@breakEmu_World/WorldClient"
import Bank from "../items/Bank"

class BankExchange extends Exchange {
	logger: Logger = new Logger("BankExchange")
	private static maxStorageSlots: number = 300

	private characterBank: Bank

	constructor(character: Character, bankItems: Bank) {
		super(character)

		this.characterBank = bankItems
	}

	async open(): Promise<void> {
		try {
			this.character.isBankDialog = true
			await this.character.client?.Send(
				new ExchangeStartedWithStorageMessage(
					ExchangeTypeEnum.BANK,
					BankExchange.maxStorageSlots
				)
			)

			const objs: ObjectItem[] = []

			this.characterBank.items.forEach(async (item) => {
				const obj = item.getObjectItem()
				console.log(obj)
				objs.push(obj)
			})

			await this.character.client.Send(
				new StorageInventoryContentMessage(objs, this.character.bank.kamas)
			)

			await this.character.reply(
				"You have " + objs.length + " items in your bank."
			)
		} catch (error) {
			this.logger.error("Error while opening bank exchange: ", error as any)
		}
	}

	async close(): Promise<void> {
		try {
			this.character.removeDialog()
			await DialogHandler.leaveDialogMessage(
				this.character.client as WorldClient,
				DialogTypeEnum.DIALOG_EXCHANGE
			)
			await this.character.inventory.refresh()
			this.character.isBankDialog = false
		} catch (error) {
			this.logger.error("Error while closing bank exchange: ", error as any)
		}
	}

	public async moveItem(objectUID: number, quantity: number): Promise<void> {
		try {
			await this.character.bank.moveItem(objectUID, quantity)
		} catch (error) {
			this.logger.error("Error while moving item: ", error as any)
		}
	}

	public moveItemPriced(
		objectUID: number,
		quantity: number,
		price: number
	): void {
		throw new Error("Method not implemented.")
	}
	public modifyItemPriced(
		objectUID: number,
		quantity: number,
		price: number
	): void {
		throw new Error("Method not implemented.")
	}
	public ready(ready: boolean, step: number): void {
		throw new Error("Method not implemented.")
	}
	public moveKamas(quantity: number): void {
		throw new Error("Method not implemented.")
	}
}

export default BankExchange
