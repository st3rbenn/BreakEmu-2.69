import BankItem from "@breakEmu_API/model/BankItem.model"
import Container from "@breakEmu_Core/container/Container"
import Logger from "@breakEmu_Core/Logger"
import Effect from "@breakEmu_World/manager/entities/effect/Effect"
import EffectCollection from "@breakEmu_World/manager/entities/effect/EffectCollection"
import EffectInteger from "@breakEmu_World/manager/entities/effect/EffectInteger"
import Database from "../Database"
import Character from "../model/character.model"

class bankItemController {
	private logger: Logger = new Logger("bankItemController")
	private container: Container = Container.getInstance()
	public database: Database = this.container.get(Database)

	async createBankItem(item: BankItem, character: Character) {
		try {
			const findSame = await this.getBankItemByGid(character.id, item.gId)

			if (findSame) {
				this.logger.error(
					`Item ${item.gId} already exists in bank`,
					new Error(`Item ${item.gId} already exists in bank`)
				)
				return
			}

			const bankItem = await this.database.prisma.bankItem.create({
				data: {
					characterId: character.id,
					itemId: item.id,
					gId: item.gId,
					appearanceId: item.appearanceId,
					position: item.position,
					quantity: item.quantity,
					look: item.look,
					effects: item.effects.saveAsJson(),
				},
			})

			return bankItem
		} catch (error) {
			this.logger.error("Error while creating bank item", error as any)
		}
	}

	async getBankItemByGid(characterId: number, gid: number) {
		try {
			const bankItem = await this.database.prisma.bankItem.findFirst({
				where: {
					characterId,
					gId: gid,
				},
			})
			return bankItem
		} catch (error) {
			this.logger.error("Error while getting bank item by gid", error as any)
		}
	}

	async getBankItemByItemId(characterId: number, itemId: number) {
		try {
			const bankItem = await this.database.prisma.bankItem.findFirst({
				where: {
					characterId,
					itemId,
				},
			})
			return bankItem
		} catch (error) {
			this.logger.error(
				"Error while getting bank item by item id",
				error as any
			)
		}
	}

	async getBankItems(characterId: number) {
		const bankItems: BankItem[] = []
		try {
			const allBankItems = await this.database.prisma.bankItem.findMany({
				where: {
					characterId,
				},
			})

			for (const item of allBankItems) {
				let effects: EffectCollection = new EffectCollection([])
				const effs = JSON.parse(item.effects?.toString() as string) as Effect[]

				for (const eff of effs) {
					effects.effects.set(
						eff.effectId,
						new EffectInteger(
							eff.effectId,
							eff.order,
							eff.targetId,
							eff.targetMask,
							eff.duration,
							eff.delay,
							eff.random,
							eff.group,
							eff.modificator,
							eff.trigger,
							eff.rawTriggers,
							eff.rawZone,
							eff.dispellable,
							eff.value
						)
					)
				}

				const bankItem = new BankItem(
					item.itemId,
					item.gId,
					item.position,
					item.quantity,
					effects,
					item.appearanceId,
					item.look || "",
					item.characterId
				)

				bankItems.push(bankItem)
			}

			return bankItems
		} catch (error) {
			this.logger.error("Error while getting bank items", error as any)
		}
	}

	async removeBankItem(
		characterId: number,
		itemId: number,
		quantity: number = 0
	): Promise<boolean> {
		try {
			const bankItem = await this.getBankItemByItemId(characterId, itemId)
			if (!bankItem) {
				return false
			}

			if (quantity == 0) {
				//delete item
				await this.database.prisma.bankItem.delete({
					where: {
						characterId_itemId: {
							characterId,
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

			await this.database.prisma.bankItem.update({
				where: {
					characterId_itemId: {
						characterId,
						itemId,
					},
				},
				data: {
					quantity: bankItem.quantity - quantity,
				},
			})

			return true
		} catch (error) {
			this.logger.error("Error while removing bank item", error as any)
			return false
		}
	}

	async addBankItem(
		characterId: number,
		itemId: number,
		quantity: number = 1
	): Promise<boolean> {
		try {
			const bankItem = await this.getBankItemByItemId(characterId, itemId)
			if (!bankItem) {
				return false
			}

			if (quantity < 1) {
				return false
			}

			await this.database.prisma.bankItem.update({
				where: {
					characterId_itemId: {
						characterId,
						itemId,
					},
				},
				data: {
					quantity: bankItem.quantity + quantity,
				},
			})

			return true
		} catch (error) {
			this.logger.error("Error while adding bank item", error as any)
			return false
		}
	}

	async updateBankItem(item: BankItem, characterId: number) {
		try {
			await this.database.prisma.bankItem.update({
				where: {
					characterId_itemId: { characterId: characterId, itemId: item.id },
				},
				data: {
					position: item.position,
					quantity: item.quantity,
					look: item.look,
					effects: item.effects.saveAsJson(),
				},
			})
		} catch (error) {
			this.logger.error(
				`Error updating bank item ${item.id} ${item.gId}`,
				error as any
			)
		}
	}
}

export default bankItemController
