import BankItem from "@breakEmu_API/model/BankItem.model"
import Character from "@breakEmu_API/model/character.model"
import ItemCollection from "./collections/ItemCollections"
import CharacterItem from "@breakEmu_API/model/characterItem.model"
import {
	CharacterInventoryPositionEnum,
	ExchangeObjectAddedMessage,
	ObjectItem,
	StorageInventoryContentMessage,
	StorageObjectRemoveMessage,
	StorageObjectUpdateMessage,
} from "@breakEmu_Protocol/IO"
import bankItemController from "@breakEmu_API/controller/bankItem.controller"

class Bank extends ItemCollection<BankItem> {
	character: Character

	kamas: number = 0

	constructor(character: Character, items: BankItem[] = [], kamas: number = 0) {
		super(items)
		this.character = character
		this.kamas = kamas
	}

	public getItemByGid(gId: number): BankItem | undefined {
		return Array.from(this.items.values()).find((item) => item.gId === gId)
	}

	public async moveItem(itemId: number, quantity: number) {
		try {
			let item: CharacterItem | BankItem | undefined = undefined
			console.log("Moving item", itemId, quantity)
			if (quantity > 0) {
				item = await this.character.inventory.getItem(itemId)
				if (item) {
					console.log("Item found in inventory")
					const itemRes = await this.character.inventory.getItemByGid(item.gId)
					console.log("Item result", itemRes)
					if (itemRes != null && (await this.canAddItem(itemRes, quantity))) {
						console.log("Adding item to bank")
						await this.addNewItem(itemRes, quantity)
					}
				}
			} else if (quantity < 0) {
				item = this.items.get(itemId)
				if (item) {
					await this.removeItem(item, Math.abs(quantity))

					await this.character.inventory.addItem(
						item.toCharacterItem(),
						Math.abs(quantity),
						this.character.id
					)
				}
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async addNewItem(
		item: CharacterItem,
		quantity: number
	): Promise<void> {
		try {
			let sameItem: BankItem | undefined = this.getItemByGid(item.gId)
			const itemCuted = await this.character.inventory.cutItem(
				item,
				quantity,
				CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED,
				false
			)

			if (sameItem) {
				sameItem.quantity += quantity
				console.log("Item already exists in bank, stacking")
				await this.onItemQuantityChanged(sameItem)
				await this.onItemStacked(sameItem)
				await sameItem.save()
			} else {
				console.log("Item does not exist in bank, adding new item")
				itemCuted.id = item.id
				this.items.set(itemCuted.id, itemCuted.toBankItem())

				await this.container
					.get(bankItemController)
					.createBankItem(itemCuted.toBankItem(), this.character)
				await this.onItemAdded(itemCuted.toBankItem())
			}

			if (item.quantity >= 1) {
				await this.character.inventory.updateItem(item)
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async canAddItem(
		item: CharacterItem,
		quantity: number
	): Promise<boolean> {
		if (
			item.positionEnum !=
			CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
		) {
			console.log("Item is not in the right position")
			return false
		}

		const exchanged: BankItem | undefined = await this.getItem(item.id)

		if (!exchanged) {
			console.log("Item not found in bank")
			return true
		}

		return true
	}

	public async refresh() {
		try {
			const objectItems: ObjectItem[] = await this.getObjectsItems()

			await this.character.client?.Send(
				new StorageInventoryContentMessage(objectItems, this.kamas)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemAdded(item: BankItem): Promise<void> {
		try {
			const itemObj = item.getObjectItem()
			await this.character.client.Send(new StorageObjectUpdateMessage(itemObj))
			await this.refresh()
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemRemoved(item: BankItem): Promise<void> {
		try {
			await this.character.client.Send(new StorageObjectRemoveMessage(item.id))
			await this.container
				.get(bankItemController)
				.removeBankItem(this.character.id, item.id)
			await this.refresh()
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemStacked(item: BankItem): Promise<void> {
		try {
			const itemObj = item.getObjectItem()
			await this.character.client.Send(new StorageObjectUpdateMessage(itemObj))
			await this.refresh()
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemUnstacked(item: BankItem): Promise<void> {
		try {
			const itemObj = item.getObjectItem()
			await this.character.client.Send(new StorageObjectUpdateMessage(itemObj))
			await this.refresh()
		} catch (error) {
			console.log(error)
		}
	}

	public async onItemQuantityChanged(item: BankItem): Promise<void> {
		try {
			const itemObj = item.getObjectItem()
			await this.character.client.Send(new StorageObjectUpdateMessage(itemObj))
			await this.refresh()
		} catch (error) {
			console.log(error)
		}
	}
	public onItemsAdded(items: BankItem[]): Promise<void> {
		throw new Error("Method not implemented.")
	}
	public onItemsStackeds(items: BankItem[]): Promise<void> {
		throw new Error("Method not implemented.")
	}
	public onItemsRemoved(items: BankItem[]): Promise<void> {
		throw new Error("Method not implemented.")
	}
	public onItemsUnstackeds(items: BankItem[]): Promise<void> {
		throw new Error("Method not implemented.")
	}
	public onItemsQuantityChanged(item: BankItem[]): Promise<void> {
		throw new Error("Method not implemented.")
	}
}

export default Bank
