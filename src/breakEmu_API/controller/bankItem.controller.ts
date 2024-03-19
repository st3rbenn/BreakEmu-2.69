import BankItem from "../../breakEmu_API/model/BankItem.model"
import Logger from "../../breakEmu_Core/Logger"
import AbstractItem from "../../breakEmu_World/manager/items/AbstractItem"
import Database from "../Database"
import Character from "../model/character.model"

class bankItemController {
	private static instance: bankItemController
	private static logger: Logger = new Logger("bankItemController")
	public _database: Database = Database.getInstance()

	private constructor() {}

	public static getInstance(): bankItemController {
		if (!bankItemController.instance) {
			bankItemController.instance = new bankItemController()
		}
		return bankItemController.instance
	}

	async createBankItem(item: AbstractItem, character: Character) {
		const bankItem = await this._database.prisma.bankItem.create({
			data: {
				accountId: character.accountId,
				itemId: item.uId,
				gId: item.gId,
				appearanceId: item.appearanceId,
				position: item.position,
				quantity: item.quantity,
				look: item.look,
				effects: item.effects.saveAsJson(),
			},
		})

		return bankItem
	}

	async getBankItemByGid(accountId: number, gid: number) {
		const bankItem = await this._database.prisma.bankItem.findFirst({
			where: {
				accountId,
				gId: gid,
			},
		})
		return bankItem
	}

	async getBankItemByItemId(accountId: number, itemId: string) {
		const bankItem = await this._database.prisma.bankItem.findFirst({
			where: {
				accountId,
				itemId,
			},
		})
		return bankItem
	}

	async getBankItems(accountId: number) {
		const bankItems: BankItem[] = []
		const allBankItems = await this._database.prisma.bankItem.findMany({
			where: {
				accountId,
			},
		})

		for (const item of allBankItems) {
      const bankItem = new BankItem(
        item.itemId,
        item.gId,
        item.position,
        item.quantity,
        item.effects,
        item.appearanceId,
        item.look || "",
        item.accountId
      )

      bankItems.push(bankItem)
		}

		return bankItems
	}

	async removeBankItem(
		accountId: number,
		itemId: string,
		quantity: number = 0
	) {
		const bankItem = await this.getBankItemByItemId(accountId, itemId)
		if (!bankItem) {
			return false
		}

		if (quantity == 0) {
			//delete item
			await this._database.prisma.bankItem.delete({
				where: {
					accountId_itemId: {
						accountId,
						itemId,
					},
				},
			})
			return true
		}

		if (quantity < 1) {
			return false
		}

		if (quantity > bankItem.quantity) {
			return false
		}

		await this._database.prisma.bankItem.update({
			where: {
				accountId_itemId: {
					accountId,
					itemId,
				},
			},
			data: {
				quantity: bankItem.quantity - quantity,
			},
		})

		return true
	}

	async addBankItem(accountId: number, itemId: string, quantity: number = 1) {
		const bankItem = await this.getBankItemByItemId(accountId, itemId)
		if (!bankItem) {
			return false
		}

		if (quantity < 1) {
			return false
		}

		await this._database.prisma.bankItem.update({
			where: {
				accountId_itemId: {
					accountId,
					itemId,
				},
			},
			data: {
				quantity: bankItem.quantity + quantity,
			},
		})

		return true
	}

	async updateBankItem(item: AbstractItem, character: Character) {
		await this._database.prisma.bankItem.update({
			where: {
				accountId_itemId: { accountId: character.accountId, itemId: item.uId },
			},
			data: {
				position: item.position,
				quantity: item.quantity,
				look: item.look,
				effects: item.effects.saveAsJson(),
			},
		})
	}
}

export default bankItemController
