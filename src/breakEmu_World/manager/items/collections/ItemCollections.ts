//generic abstract class for item collections

import CharacterItemController from "../../../../breakEmu_API/controller/characterItem.controller"
import {
	CharacterInventoryPositionEnum,
	ObjectItem,
} from "../../../../breakEmu_Server/IO"
import AbstractItem from "../AbstractItem"

abstract class ItemCollection<T extends AbstractItem> {
	private _items: Map<number, T> = new Map<number, T>()
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
				const id = await CharacterItemController.getInstance().getIntIdFromUuid(
					item.uId
				)
				this._items.set(id as number, item)
			}
		}
	}

	public *[Symbol.iterator]() {
		for (let item of this._items) {
			yield item
		}
	}

	public get items(): Map<number, T> {
		return this._items
	}

	private createContainer(): Map<number, T> {
		return new Map<number, T>()
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
				sameItem.quantity += item.quantity

				if (!stackedItems.includes(sameItem)) {
					stackedItems.push(sameItem)
				}
			} else {
				const id = await CharacterItemController.getInstance().getIntIdFromUuid(
					item.uId
				)
				this._items.set(id as number, item)
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
				if (sameItem.quantity > item.quantity) {
					sameItem.quantity -= item.quantity
					unstackedItems.push(sameItem)
				} else {
					const id = await CharacterItemController.getInstance().getIntIdFromUuid(
						sameItem.uId
					)
					this._items.delete(id as number)
					removedItems.push(sameItem)
				}
			}
		}

		this.onItemsRemoved(removedItems)
		this.onItemsUnstackeds(unstackedItems)
		this.onItemsQuantityChanged(unstackedItems)
	}

	public async addItem(item: T, quantity: number = 1) {
		try {
			item.initialize()

			let sameItem: T | undefined = await this.getSameItem(item)

			if (sameItem) {
				sameItem.quantity += quantity
				this.onItemStacked(sameItem)
				this.onItemQuantityChanged(sameItem)
			} else {
				const id = await CharacterItemController.getInstance().getIntIdFromUuid(
					item.uId
				)
				this._items.set(id as number, item)
				this.onItemAdded(item)
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
					const id = await CharacterItemController.getInstance().getIntIdFromUuid(
						item.uId
					)
					this._items.delete(id as number)
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
		const id = await CharacterItemController.getInstance().getIntIdFromUuid(
			item.uId
		)
		return this._items.get(id as number)
	}

	public async getObjectsItems(): Promise<ObjectItem[]> {
		let objectsItems: ObjectItem[] = []

		for (const [key, item] of this._items) {
			const objectItem = await item.getObjectItem()
			objectsItems.push(objectItem)
		}

		return objectsItems
	}

  public async getItem(id: number): Promise<T | undefined> {
    return this._items.get(id)
  }
}

export default ItemCollection
