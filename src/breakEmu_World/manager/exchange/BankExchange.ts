import Character from "../../../breakEmu_API/model/character.model"
import Logger from "../../../breakEmu_Core/Logger"
import {
	ExchangeStartedWithStorageMessage,
	ExchangeTypeEnum,
	ObjectItem,
	StorageInventoryContentMessage,
} from "../../../breakEmu_Server/IO"
import Exchange from "../exchange/Exchange"
import BankItem from "../../../breakEmu_API/model/BankItem.model"

class BankExchange extends Exchange {
	logger: Logger = new Logger("BankExchange")
	private static maxStorageSlots: number = 300

	private bankItems: Map<number, BankItem> = new Map<number, BankItem>()

	constructor(character: Character, bankItems: Map<number, BankItem>) {
		super(character)

		this.bankItems = bankItems
	}

	async open(): Promise<void> {
		try {
			await this.character.client?.Send(
				new ExchangeStartedWithStorageMessage(
					ExchangeTypeEnum.BANK,
					BankExchange.maxStorageSlots
				)
			)

			const objs: ObjectItem[] = []

			this.bankItems.forEach(async (item) => {
				const obj = await item.getObjectItem()
				objs.push(obj)
			})

			await this.character.client?.Send(
				new StorageInventoryContentMessage(objs, this.character.bank.kamas)
			)

			await this.character.reply(
				"You have " + objs.length + " items in your bank."
			)
		} catch (error) {
			this.logger.error(error as any)
		}
	}
}

export default BankExchange
