import Recipe from "@breakEmu_API/model/recipe.model"
import Container from "@breakEmu_Core/container/Container"
import Logger from "@breakEmu_Core/Logger"
import {
	ExchangeCraftCountModifiedMessage,
	ExchangeCraftCountRequestMessage,
	ExchangeObjectMoveKamaMessage,
	ExchangeObjectMoveMessage,
	ExchangeObjectTransfertAllFromInvMessage,
	ExchangeObjectTransfertAllToInvMessage,
	ExchangeObjectTransfertExistingFromInvMessage,
	ExchangeObjectTransfertExistingToInvMessage,
	ExchangeObjectTransfertListFromInvMessage,
	ExchangeObjectTransfertListToInvMessage,
	ExchangeReadyMessage,
	ExchangeSetCraftRecipeMessage,
} from "@breakEmu_Protocol/IO"
import AuctionHouseDialog from "@breakEmu_World/manager/dialog/auctionHouse/AuctionHouseDialog"
import CraftExchange from "@breakEmu_World/manager/dialog/job/CraftExchange"
import BankExchange from "@breakEmu_World/manager/exchange/BankExchange"
import Exchange from "@breakEmu_World/manager/exchange/Exchange"
import WorldClient from "@breakEmu_World/WorldClient"

class ContextExchangeHandler {
	private static logger: Logger = new Logger("ContextExchangeHandler")
	private static container: Container = Container.getInstance()

	static async handleExchangeSetCraftRecipeMessage(
		client: WorldClient,
		message: ExchangeSetCraftRecipeMessage
	) {
		const objectGID = message.objectGID
		try {
			if (!Recipe.getRecipeByResultId(objectGID as number)) {
				await client.selectedCharacter.reply("Recipe not found")
				return
			}

			if (!client.selectedCharacter.isCraftDialog) {
				return
			}

			const craftExchange = client.selectedCharacter.dialog as CraftExchange

			await craftExchange.setRecipe(objectGID as number)
		} catch (error) {
			this.logger.error("Error while setting recipe: ", error as any)
		}
	}

	static async handleExchangeObjectMoveMessage(
		client: WorldClient,
		message: ExchangeObjectMoveMessage
	) {
		const { objectUID, quantity } = message

		try {
			if (client.selectedCharacter.isCraftDialog) {
				const craftExchange = client.selectedCharacter.dialog as CraftExchange

				await craftExchange.moveItem(objectUID as number, quantity as number)
				return
			}

			if (client.selectedCharacter.isBankDialog) {
				const bankExchange = client.selectedCharacter.dialog as BankExchange

				await bankExchange.moveItem(objectUID as number, quantity as number)
				return
			}

			if (client.selectedCharacter.isAuctionHouseDialog) {
				const auctionHouseExchange = client.selectedCharacter
					.dialog as AuctionHouseDialog

				await auctionHouseExchange.moveItem(
					objectUID as number,
					Math.abs(quantity as number)
				)
        return
			}
		} catch (error) {
			this.logger.error("Error while moving item: ", error as any)
		}
	}

	static async handleExchangeObjectMoveKamaMessage(
		client: WorldClient,
		message: ExchangeObjectMoveKamaMessage
	) {
		const { quantity } = message

		if (client.selectedCharacter.isBankDialog) {
			const bankExchange = client.selectedCharacter.dialog as BankExchange

			try {
				await bankExchange.moveKamas(quantity!)
			} catch (error) {
				this.logger.error("Error while moving kamas: ", error as any)
			}
		}
	}

	static async handleExchangeCraftCountRequestMessage(
		client: WorldClient,
		message: ExchangeCraftCountRequestMessage
	): Promise<void> {
		const craftExchange = client.selectedCharacter.dialog as CraftExchange

		craftExchange.setCount(message.count as number)

		try {
			await client.Send(
				new ExchangeCraftCountModifiedMessage(craftExchange.count)
			)
		} catch (error) {
			this.logger.error("Error while setting count: ", error as any)
		}
	}

	static async handleExchangeReadyMessage(
		client: WorldClient,
		message: ExchangeReadyMessage
	) {
		if (client.selectedCharacter.dialog instanceof Exchange) {
			const exchange = client.selectedCharacter.dialog as CraftExchange

			try {
				await exchange.ready(message.ready as boolean, message.step as number)
			} catch (error) {
				this.logger.error("Error while setting ready: ", error as any)
			}
		}
	}

	static async handleExchangeObjectTransfertListFromInvMessage(
		client: WorldClient,
		message: ExchangeObjectTransfertListFromInvMessage
	) {
		const { ids } = message
		const itemsInInventory = client.selectedCharacter.inventory.getItemsByUids(
			ids!
		)

		if (client.selectedCharacter.isBankDialog) {
			const bankExchange = client.selectedCharacter.dialog as BankExchange

			try {
				await bankExchange.moveItems(itemsInInventory)
			} catch (error) {
				this.logger.error(
					"Error while transfering list of items from inventory: ",
					error as any
				)
			}
		}
	}

	static async handleExchangeObjectTransfertListToInvMessage(
		client: WorldClient,
		message: ExchangeObjectTransfertListToInvMessage
	) {
		const { ids } = message
		let itemsInBank = client.selectedCharacter.bank.getItemsByUids(ids!)

		itemsInBank = itemsInBank.map((item) => {
			item.quantity = -item.quantity
			return item
		})

		if (client.selectedCharacter.isBankDialog) {
			const bankExchange = client.selectedCharacter.dialog as BankExchange

			try {
				await bankExchange.moveItems(itemsInBank)
			} catch (error) {
				this.logger.error(
					"Error while transfering list of items to inventory: ",
					error as any
				)
			}
		}
	}

	static async handleExchangeObjectTransfertAllFromInvMessage(
		client: WorldClient,
		message: ExchangeObjectTransfertAllFromInvMessage
	) {
		const itemsInInventory = Array.from(
			client.selectedCharacter.inventory.items.values()
		)

		if (client.selectedCharacter.isBankDialog) {
			const bankExchange = client.selectedCharacter.dialog as BankExchange

			try {
				await bankExchange.moveItems(itemsInInventory)
			} catch (error) {
				this.logger.error(
					"Error while transfering all items from inventory: ",
					error as any
				)
			}
		}
	}

	static async handleExchangeObjectTransfertAllToInvMessage(
		client: WorldClient,
		message: ExchangeObjectTransfertAllToInvMessage
	) {
		let itemsInBank = Array.from(client.selectedCharacter.bank.items.values())

		itemsInBank = itemsInBank.map((item) => {
			item.quantity = -item.quantity
			return item
		})

		if (client.selectedCharacter.isBankDialog) {
			const bankExchange = client.selectedCharacter.dialog as BankExchange

			try {
				await bankExchange.moveItems(itemsInBank)
			} catch (error) {
				this.logger.error(
					"Error while transfering all items to inventory:: ",
					error as any
				)
			}
		}
	}

	static async handleExchangeObjectTransfertExistingFromInvMessage(
		client: WorldClient,
		message: ExchangeObjectTransfertExistingFromInvMessage
	) {
		const allItemsGidsFromBank = Array.from(
			client.selectedCharacter.bank.items.values()
		).map((item) => item.gId)

		const getAllItemsFromInventory = Array.from(
			client.selectedCharacter.inventory.items.values()
		).filter((item) => allItemsGidsFromBank.includes(item.gId))

		if (client.selectedCharacter.isBankDialog) {
			const bankExchange = client.selectedCharacter.dialog as BankExchange

			try {
				await bankExchange.moveItems(getAllItemsFromInventory)
			} catch (error) {
				this.logger.error(
					"Error while transfering existing items from inventory: ",
					error as any
				)
			}
		}
	}

	static async handleExchangeObjectTransfertExistingToInvMessage(
		client: WorldClient,
		message: ExchangeObjectTransfertExistingToInvMessage
	) {
		const allItemsGidsFromInventory = Array.from(
			client.selectedCharacter.inventory.items.values()
		).map((item) => item.gId)

		let getAllItemsFromBank = Array.from(
			client.selectedCharacter.bank.items.values()
		).filter((item) => allItemsGidsFromInventory.includes(item.gId))

		getAllItemsFromBank = getAllItemsFromBank.map((item) => {
			item.quantity = -item.quantity
			return item
		})

		if (client.selectedCharacter.isBankDialog) {
			const bankExchange = client.selectedCharacter.dialog as BankExchange

			try {
				await bankExchange.moveItems(getAllItemsFromBank)
			} catch (error) {
				this.logger.error(
					"Error while transfering existing items to inventory: ",
					error as any
				)
			}
		}
	}
}

export default ContextExchangeHandler
