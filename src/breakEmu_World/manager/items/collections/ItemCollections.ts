//generic abstract class for item collections

import CharacterItemController from "@breakEmu_API/controller/characterItem.controller"
import {
	CharacterInventoryPositionEnum,
	ObjectItem,
} from "@breakEmu_Protocol/IO"
import AbstractItem from "../AbstractItem"
import EffectCollection from "@breakEmu_World/manager/entities/effect/EffectCollection"
import Container from "@breakEmu_Core/container/Container"

abstract class ItemCollection<T extends AbstractItem> {
	private _items: Map<number, T> = new Map<number, T>()
	public count: number = 0
	public container: Container = Container.getInstance()

	constructor(items: T[] = []) {
		this._items = this.createContainer()

		this.loadItems(items)
	}

	public async loadItems(items: T[]) {
		if (items) {
			for (const item of items) {
				this.items.set(item.id, item)
			}
		}
	}

	public *[Symbol.iterator]() {
		for (let item of this.items) {
			yield item
		}
	}

	public get items(): Map<number, T> {
		return this._items
	}

	private createContainer(): Map<number, T> {
		return new Map<number, T>()
	}

	public abstract onItemAdded(item: T): Promise<void>
	public abstract onItemStacked(item: T): Promise<void>
	public abstract onItemRemoved(item: T): Promise<void>
	public abstract onItemUnstacked(item: T): Promise<void>
	public abstract onItemsAdded(items: T[]): Promise<void>
	public abstract onItemsStackeds(items: T[]): Promise<void>
	public abstract onItemsRemoved(items: T[]): Promise<void>
	public abstract onItemsUnstackeds(items: T[]): Promise<void>
	public abstract onItemQuantityChanged(item: T): Promise<void>
	public abstract onItemsQuantityChanged(item: T[]): Promise<void>

	public async addItems(items: T[]) {
		try {
			let addedItems: T[] = []
			let stackedItems: T[] = []

			for (const item of items) {
				item.initialize()

				let sameItem: T | undefined = await this.getSameItem(
					item.gId,
					item.effects,
					item.position
				)

				if (sameItem) {
					console.log(
						`sameItem found for addItems: ${sameItem.quantity} > ${item.quantity}`
					)
					sameItem.quantity += item.quantity

					if (!stackedItems.includes(sameItem)) {
						stackedItems.push(sameItem)
					}
				} else {
					this.items.set(item.id, item)
					addedItems.push(item)
				}
			}

			await this.onItemsAdded(addedItems)
			await this.onItemsStackeds(stackedItems)
			await this.onItemsQuantityChanged(stackedItems)
		} catch (error) {
			console.log(error)
		}
	}

	public async removeItems(items: T[]) {
		try {
			const removedItems: T[] = []
			const unstackedItems: T[] = []

			for (const item of items) {
				const sameItem = await this.getSameItem(
					item.gId,
					item.effects,
					item.position
				)

				if (sameItem) {
					if (sameItem.quantity > item.quantity) {
						console.log(
							`Unstacking item: ${sameItem.id}, old quantity: ${sameItem.quantity}, removing: ${item.quantity}`
						)
						sameItem.quantity -= item.quantity
						unstackedItems.push(sameItem)
					} else if (sameItem.quantity === item.quantity) {
						console.log(
							`Removing item completely from Inventory: ${sameItem.id}`
						)
						this.items.delete(sameItem.id)
						removedItems.push(sameItem)
						await this.removeItem(sameItem)
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

	public async addItem(item: T, quantity: number = 1, characterId: number) {
		try {
			item.initialize()

			let sameItem: T | undefined = await this.getSameItem(
				item.gId,
				item.effects,
				item.position
			)

			if (sameItem != undefined) {
				console.log(
					`sameItem found for addItem: ${sameItem.quantity} > ${quantity}`
				)
				sameItem.quantity += quantity
				this.onItemQuantityChanged(sameItem)
				this.onItemStacked(sameItem)
			} else {
				item.quantity = quantity
				const result = await this.container
					.get(CharacterItemController)
					.createCharacterItem(item, characterId)

				if (result) {
					console.log(
						`new item created with id: ${result.id} and quantity: ${result.quantity} (name: ${result.record.name})`
					)
					item.id = result.id
					this.items.set(result.id, item)
					this.onItemAdded(item)
				}
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async removeItem(item: T, quantity: number = 1) {
		if (item != null) {
			if (
				item.positionEnum !=
				CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
			) {
				return
			}

			if (item.quantity >= quantity) {
				if (item.quantity == quantity) {
					this.items.delete(item.id)
					this.onItemRemoved(item)
				} else {
					item.quantity -= quantity
					this.onItemUnstacked(item)
					this.onItemQuantityChanged(item)
				}
			}
		}
	}

	public async getSameItem(
		itemGid: number,
		effects: EffectCollection,
		positionEnum: CharacterInventoryPositionEnum
	): Promise<T | undefined> {
		let same: T

		for (const [key, value] of this.items) {
			if (
				value.gId == itemGid &&
				value.effects.sequenceEqual(effects) &&
				value.positionEnum == positionEnum
			) {
				same = value
				return same
			}
		}
	}

	public async getObjectsItems(): Promise<ObjectItem[]> {
		let objectsItems: ObjectItem[] = []

		for (const [key, item] of this.items) {
			const objectItem = await item.getObjectItem()
			objectsItems.push(objectItem)
		}

		return objectsItems
	}

	public async getItem(id: number): Promise<T | undefined> {
		return this.items.get(id)
	}
}

export default ItemCollection
