//generic abstract class for item collections

import CharacterItemController from "@breakEmu_API/controller/characterItem.controller"
import {
  CharacterInventoryPositionEnum,
  ObjectItem,
} from "@breakEmu_Protocol/IO"
import AbstractItem from "../AbstractItem"

abstract class ItemCollection<T extends AbstractItem> {
	private _items: Map<string, T> = new Map<string, T>()
	public _count: number = 0

	public get count(): number {
		return this._count
	}

	constructor(items: T[] = []) {
		this._items = this.createContainer()

		this.loadItems(items)
	}

	public async loadItems(items: T[]) {
		if (items) {
			for (const item of items) {
				this._items.set(item.uId, item)
			}
		}
	}

	public *[Symbol.iterator]() {
		for (let item of this._items) {
			yield item
		}
	}

	public get items(): Map<string, T> {
		return this._items
	}

	private createContainer(): Map<string, T> {
		return new Map<string, T>()
	}

	public abstract onItemAdded(item: T): void
	public abstract onItemStacked(item: T): void
	public abstract onItemRemoved(item: T): void
	public abstract onItemUnstacked(item: T): void
	public abstract onItemsAdded(items: T[]): void
	public abstract onItemsStackeds(items: T[]): void
	public abstract onItemsRemoved(items: T[]): void
	public abstract onItemsUnstackeds(items: T[]): void
	public abstract onItemQuantityChanged(item: T): void
	public abstract onItemsQuantityChanged(item: T[]): void

	public async addItems(items: T[]) {
		let addedItems: T[] = []
		let stackedItems: T[] = []

		for (const item of items) {
			item.initialize()

			let sameItem: T | undefined = await this.getSameItem(item)

			if (sameItem) {
				console.log(
					`sameItem found for addItems: ${sameItem.quantity} > ${item.quantity}`
				)
				sameItem.quantity += item.quantity

				if (!stackedItems.includes(sameItem)) {
					stackedItems.push(sameItem)
				}
			} else {
				this._items.set(item.uId, item)
				addedItems.push(item)
			}
		}

		this.onItemsAdded(addedItems)
		this.onItemsStackeds(stackedItems)
		this.onItemsQuantityChanged(stackedItems)
	}

	public async removeItems(items: T[]) {
		let removedItems: T[] = []
		let unstackedItems: T[] = []

		for (const item of items) {
			let sameItem: T | undefined = await this.getSameItem(item)

			if (sameItem) {
				console.log("sameItem found for removeItems")
				console.log(
					`sameItem quantity > item quantity ${sameItem.quantity} > ${item.quantity}`
				)
				if (sameItem.quantity > item.quantity) {
					console.log("UNSTACK ITEM")
					sameItem.quantity -= item.quantity
					unstackedItems.push(sameItem)
				}

        if (sameItem.quantity == item.quantity) {
          console.log("REMOVE ITEM")
          this._items.delete(sameItem.uId)
          removedItems.push(sameItem)
        }
			}
		}

		this.onItemsRemoved(removedItems)
		this.onItemsUnstackeds(unstackedItems)
		this.onItemsQuantityChanged(unstackedItems)
	}

	public async addItem(
		item: T,
		quantity: number = 1,
		characterId: number,
		createItem: boolean = true
	) {
		try {
			item.initialize()

			let sameItem: T | undefined = await this.getSameItem(item)

			if (sameItem) {
				console.log("sameItem found for addItem")
				sameItem.quantity += quantity
				this.onItemQuantityChanged(sameItem)
			} else {
				if (createItem) {
					const {
						idMapping,
					} = await CharacterItemController.getInstance().createCharacterItemWithMapping(
						item,
						characterId
					)
					this._items.set(idMapping.uuid, item)
					this.onItemAdded(item)
				} else {
					item.quantity = quantity
					this._items.set(item.uId, item)
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
					this._items.delete(item.uId)
					this.onItemRemoved(item)
				} else {
					item.quantity -= quantity
					this.onItemUnstacked(item)
					this.onItemQuantityChanged(item)
				}
			}
		}
	}

	public async getSameItem(item: T): Promise<T | undefined> {
		let same: T

		for (const [key, value] of this._items) {
			if (
				value.record.id == item.gId &&
				value.effects.sequenceEqual(item.effects)
			) {
				same = value
				return same
			}
		}
	}

	public async getObjectsItems(): Promise<ObjectItem[]> {
		let objectsItems: ObjectItem[] = []

		for (const [key, item] of this._items) {
			const objectItem = await item.getObjectItem()
			objectsItems.push(objectItem)
		}

		return objectsItems
	}

	public async getItem(id: string): Promise<T | undefined> {
		return this._items.get(id)
	}
}

export default ItemCollection
