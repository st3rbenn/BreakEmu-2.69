import CharacterItemController from "@breakEmu_API/controller/characterItem.controller"
import Character from "@breakEmu_API/model/character.model"
import CharacterItem from "@breakEmu_API/model/characterItem.model"
import {
	CharacterInventoryPositionEnum,
	ExchangeObjectAddedMessage,
	ExchangeObjectModifiedMessage,
	ExchangeObjectMoveMessage,
	ExchangeObjectRemovedMessage,
	ExchangeObjectsAddedMessage,
	ExchangeObjectsModifiedMessage,
	ExchangeObjectsRemovedMessage,
	ObjectItem,
} from "@breakEmu_Protocol/IO"
import ItemCollection from "./ItemCollections"
import { randomUUID } from "crypto"
import Recipe from "@breakEmu_API/model/recipe.model"

class JobItemCollection extends ItemCollection<CharacterItem> {
	private character: Character

	constructor(character: Character) {
		super()
		this.character = character
	}

	public async getItemByGid(gid: number): Promise<CharacterItem | undefined> {
		return (
			Array.from(this.items.values()).find((item) => item.gId === gid) ||
			undefined
		)
	}

	public async canAddItem(
		item: CharacterItem,
		quantity: number
	): Promise<boolean> {
		if (
			item.positionEnum !=
			CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
		) {
			return false
		}

		const exchanged: CharacterItem | undefined = await this.getItem(item.id)

		if (!exchanged) {
			return true
		}

		if (exchanged.quantity + quantity > item.quantity) {
			return false
		} else {
			return true
		}
	}

	public async moveItem(item: CharacterItem, quantity: number) {
		let itemRes: CharacterItem | undefined = undefined
		try {
			if (quantity > 0) {
				itemRes = this.character.inventory.items.get(item.id)

				if (itemRes && (await this.canAddItem(item, quantity))) {
					await this.addItem(item, quantity)
				}
			} else if (quantity < 0) {
				itemRes = await this.getItemByGid(item.gId)
				if (itemRes) {
					await this.removeItem(item, Math.abs(quantity))
				} else {
					console.log(`Item not found in player inventory`)
				}
			} else {
				return
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async addItem(item: CharacterItem, quantity: number): Promise<void> {
		try {
			let sameItem: CharacterItem | undefined = await this.getItemByGid(
				item.gId
			)

			if (sameItem) {
				sameItem.quantity += quantity
				this.onItemQuantityChanged(sameItem)
				this.onItemStacked(sameItem)
			} else {
				this.items.set(item.id, item)
				this.onItemAdded(item)
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async clear(): Promise<void> {
		console.log(`CLEARING JOB INVENTORY`)
		try {
			const items = Array.from(this.items.values())

			const itemsModified: CharacterItem[] = []

			console.log(`items: ${items.length}`)

			for (const item of items) {
				console.log(`item: ${item.record.name} - ${item.quantity}`)
				const getItemFromPlayerInventory = await this.character.inventory.getItemByGid(
					item.gId
				)
				if (getItemFromPlayerInventory) {
					getItemFromPlayerInventory.quantity += item.quantity
					itemsModified.push(getItemFromPlayerInventory)
				} else {
					console.log(`Item not found in player inventory`)
				}
			}

			await this.character.inventory.onItemsQuantityChanged(itemsModified)
			await this.character.inventory.onItemsStackeds(itemsModified)
			await this.onItemsRemoved(itemsModified)

			this.items.clear()
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemAdded(item: CharacterItem): Promise<void> {
		try {
			const itemObj = await item.getObjectItem()
			await this.character.client.Send(
				new ExchangeObjectAddedMessage(false, itemObj)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemRemoved(item: CharacterItem): Promise<void> {
		try {
			await this.character.client.Send(
				new ExchangeObjectRemovedMessage(false, item.id)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemQuantityChanged(item: CharacterItem): Promise<void> {
		try {
			const itemObj = await item.getObjectItem()
			await this.character.client.Send(
				new ExchangeObjectModifiedMessage(false, itemObj)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public isJobInventoryEqualsToRecipeIngredients(recipe: Recipe): boolean {
		const jobItems = Array.from(this.items.values())
		const recipeIngredients = recipe.ingredients

		if (jobItems.length !== recipeIngredients.length) {
			return false
		}

		for (const ingredient of recipeIngredients) {
			const jobItem = jobItems.find((item) => item.gId === ingredient.id)

			if (!jobItem || jobItem.quantity < ingredient.quantity) {
				return false
			}
		}

		return true
	}

	public async onItemStacked(item: CharacterItem): Promise<void> {
		try {
			const itemObj = await item.getObjectItem()
			await this.character.client.Send(
				new ExchangeObjectModifiedMessage(true, itemObj)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemUnstacked(item: CharacterItem): Promise<void> {
		try {
			const itemObj = await item.getObjectItem()
			await this.character.client.Send(
				new ExchangeObjectModifiedMessage(true, itemObj)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async removeItem(
		item: CharacterItem,
		quantity: number
	): Promise<void> {
		const itemsToRemove: CharacterItem[] = []
		try {
			const sameItem: CharacterItem | undefined = await this.getItemByGid(
				item.gId
			)

			if (sameItem) {
				if (sameItem.quantity > quantity) {
					console.log(
						`sameItem found for removeItem from jobItemCollection: ${sameItem.quantity} > ${quantity}`
					)
					sameItem.quantity -= quantity
					this.onItemQuantityChanged(sameItem)
				} else if (sameItem.quantity === quantity) {
					console.log(
						`sameItem found for removeItem from jobItemCollection: ${sameItem.quantity} === ${quantity}`
					)
					this.items.delete(item.id)

					// add item to player inventory
					const getItemFromPlayerInventory = await this.character.inventory.getItemByGid(
						item.gId
					)

					if (getItemFromPlayerInventory) {
						const newQuantity = getItemFromPlayerInventory.quantity + quantity
						getItemFromPlayerInventory.quantity = newQuantity

						itemsToRemove.push(getItemFromPlayerInventory)
					} else {
						console.log(`Item not found in player inventory`)
					}
				} else {
					console.warn(
						`Item quantity incorrect: ${sameItem.quantity} < ${quantity}`
					)
				}
			} else {
				console.warn(`Item not found in inventory: ${item.id}`)
			}

			if (itemsToRemove.length > 1) {
				await this.onItemsRemoved(itemsToRemove)
			} else {
				await this.onItemRemoved(itemsToRemove[0])
			}
		} catch (error) {
			console.error("Error in removeItem:", error)
		}
	}

	public async removeItems(items: CharacterItem[]) {
		try {
			const removedItems: CharacterItem[] = []
			const unstackedItems: CharacterItem[] = []

			for (const item of items) {
				const sameItem = await this.getSameItem(item.gId, item.effects)

				if (sameItem) {
					if (sameItem.quantity > item.quantity) {
						sameItem.quantity -= item.quantity
						unstackedItems.push(sameItem)
					} else if (sameItem.quantity === item.quantity) {
						this.items.delete(sameItem.id)
						removedItems.push(sameItem)
						await this.onItemRemoved(sameItem)
					} else {
						console.warn(
							`Item quantity incorrect: ${sameItem.quantity} < ${item.quantity}`
						)
					}
				} else {
					console.warn(`Item not found in inventory: ${item.id}`)
				}
			}

			return { removedItems, unstackedItems }
		} catch (error) {
			console.error("Error in removeItems:", error)
		}
	}

	public async onItemsQuantityChanged(items: CharacterItem[]): Promise<void> {
		try {
			await this.character.inventory.onItemsQuantityChanged(items)
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemsAdded(items: CharacterItem[]): Promise<void> {
		try {
			const itemsObj: ObjectItem[] = []

			for (const item of items) {
				itemsObj.push(await item.getObjectItem())
			}
			await this.character.client.Send(
				new ExchangeObjectsAddedMessage(false, itemsObj)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemsUnstackeds(items: CharacterItem[]): Promise<void> {
		try {
			const itemsObj: ObjectItem[] = []

			for (const item of items) {
				itemsObj.push(await item.getObjectItem())
			}

			await this.character.client.Send(
				new ExchangeObjectsModifiedMessage(true, itemsObj)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemsRemoved(items: CharacterItem[]): Promise<void> {
		try {
			await this.character.client.Send(
				new ExchangeObjectsRemovedMessage(
					false,
					items.map((item) => item.id)
				)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public onItemsStackeds(items: CharacterItem[]): Promise<void> {
		throw new Error("Method not implemented.")
	}

	// public async onItemMoved(
	// 	item: CharacterItem,
	// 	quantity: number
	// ): Promise<void> {
	// 	console.log(`onItemMoved job: ${item.gId} quantity: ${quantity} `)
	// 	try {
	// 		await this.character.client.Send(
	// 			new ExchangeObjectMoveMessage(item.gId, quantity)
	// 		)
	// 	} catch (error) {
	// 		console.log(error)
	// 	}
	// }

	// public async onItemRemoved(item: CharacterItem): Promise<void> {
	// 	try {
	// 		const itemUid = await this.container
	// 			.get(CharacterItemController)
	// 			.getIntIdFromUuid(item.uId)
	// 		await this.character.client.Send(
	// 			new ExchangeObjectRemovedMessage(false, itemUid as number)
	// 		)
	// 	} catch (error) {
	// 		console.log(error)
	// 	}
	// }

	// public async onItemsRemoved(items: CharacterItem[]): Promise<void> {
	// 	try {
	//     console.log(`REMOVING ITEMS onItemsRemoved from jobItemCollection: ${items.length}`)
	// 		const itemsObj = items.map((item) => item.record.id)

	// 		await this.character.client.Send(
	// 			new ExchangeObjectsRemovedMessage(false, itemsObj)
	// 		)

	// 		this.items.clear()
	// 	} catch (error) {
	// 		console.log(error)
	// 	}
	// }
}

export default JobItemCollection
