import CharacterItemController from "@breakEmu_API/controller/characterItem.controller"
import Character from "@breakEmu_API/model/character.model"
import CharacterItem from "@breakEmu_API/model/characterItem.model"
import {
	CharacterInventoryPositionEnum,
	ExchangeObjectAddedMessage,
	ExchangeObjectModifiedMessage,
	ExchangeObjectMoveMessage,
	ExchangeObjectRemovedMessage,
	ExchangeObjectsRemovedMessage,
} from "@breakEmu_Protocol/IO"
import ItemCollection from "./ItemCollections"

class JobItemCollection extends ItemCollection<CharacterItem> {
	private character: Character

	constructor(character: Character) {
		super()
		this.character = character
	}

	public async getItemByGid(gid: number): Promise<CharacterItem | null> {
		const items = Array.from(this.items.values())
		return items.find((item) => item.gId === gid) || null
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

		const exchanged: CharacterItem | undefined = await this.getItem(item.uId)

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
		if (!item) {
			console.log(`ITEM NOT FOUND`)
			return
		}

		try {
			if (quantity < 0) {
				console.log(`REMOVING ITEM: ${item.record.name} quantity: ${quantity}`)
				await this.removeItem(item, -quantity)
				if (this.items.delete(item.uId)) {
					console.log(`ITEM REMOVED`)
				} else {
					console.log(`ITEM NOT REMOVED`)
				}
			}

			if (quantity > 0) {
				console.log(`ADD ITEM: ${item.record.name} quantity: ${quantity}`)
				await this.addItem(item, quantity, this.character.id, false)
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemMoved(
		item: CharacterItem,
		quantity: number
	): Promise<void> {
		console.log(`SENDING MOVE ITEM: ${item.gId} quantity: ${quantity} `)
		try {
			await this.character.client.Send(
				new ExchangeObjectMoveMessage(item.gId, quantity)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async clear(): Promise<void> {
		console.log(`CLEARING JOB INVENTORY`)
		const itemsUid: number[] = []
		for (const item of this.items.values()) {
			const itemUid = await CharacterItemController.getInstance().getIntIdFromUuid(
				item.uId
			)
			itemsUid.push(itemUid as number)
		}

		await this.removeItems(Array.from(this.items.values()))
		await this.character.client.Send(
			new ExchangeObjectsRemovedMessage(false, itemsUid)
		)

		this.items.clear()
	}

	public async onItemStacked(item: CharacterItem): Promise<void> {
		throw new Error("Method not implemented.")
	}

	public async onItemUnstacked(item: CharacterItem): Promise<void> {
		try {
			await this.character.client.Send(
				new ExchangeObjectModifiedMessage(true, await item.getObjectItem())
			)
		} catch (error) {
			console.log(error)
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
      for (const item of items) {
        const itemUid = await CharacterItemController.getInstance().getIntIdFromUuid(
          item.uId
        )
        await this.character.client.Send(
          new ExchangeObjectAddedMessage(false, await item.getObjectItem())
        )
      }
    } catch (error) {
      console.log(error)
    }
	}

	public async onItemsStackeds(items: CharacterItem[]): Promise<void> {
    
	}

	public async onItemsUnstackeds(items: CharacterItem[]): Promise<void> {
    try {
      for (const item of items) {
        await this.character.client.Send(
          new ExchangeObjectModifiedMessage(true, await item.getObjectItem())
        )
      }
    } catch (error) {
      console.log(error)
    }
	}


	public async onItemAdded(item: CharacterItem): Promise<void> {
		const itemObj = await item.getObjectItem()
		await this.character.client.Send(
			new ExchangeObjectAddedMessage(false, itemObj)
		)
	}

	public async onItemRemoved(item: CharacterItem): Promise<void> {
		try {
			const itemUid = await CharacterItemController.getInstance().getIntIdFromUuid(
				item.uId
			)
			await this.character.client.Send(
				new ExchangeObjectRemovedMessage(false, itemUid as number)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemQuantityChanged(item: CharacterItem): Promise<void> {
		const itemObj = await item.getObjectItem()
		try {
			await this.character.client.Send(
				new ExchangeObjectModifiedMessage(false, itemObj)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemsRemoved(items: CharacterItem[]): Promise<void> {
		try {
			const itemsObj = items.map((item) => item.record.id)

			await this.character.client.Send(
				new ExchangeObjectsRemovedMessage(false, itemsObj)
			)

			this.items.clear()
		} catch (error) {
			console.log(error)
		}
	}
}

export default JobItemCollection
