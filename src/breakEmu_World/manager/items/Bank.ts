import bankItemController from "@breakEmu_API/controller/bankItem.controller"
import UserController from "@breakEmu_API/controller/user.controller"
import BankItem from "@breakEmu_API/model/BankItem.model"
import Character from "@breakEmu_API/model/character.model"
import CharacterItem from "@breakEmu_API/model/characterItem.model"
import {
	CharacterInventoryPositionEnum,
	ObjectItem,
	StorageInventoryContentMessage,
	StorageKamasUpdateMessage,
	StorageObjectRemoveMessage,
	StorageObjectUpdateMessage,
} from "@breakEmu_Protocol/IO"
import ItemCollection from "@breakEmu_World/manager/items/collections/ItemCollections"

class Bank extends ItemCollection<BankItem> {
	character: Character

	kamas: number

	constructor(character: Character, items: BankItem[] = [], kamas: number) {
		super(items)
		this.character = character
		this.kamas = kamas
	}

	public getItemByGid(gId: number): BankItem | undefined {
		return Array.from(this.items.values()).find((item) => item.gId === gId)
	}

	public getItemsByUids(uids: number[]): BankItem[] {
		return Array.from(this.items.values()).filter((item) =>
			uids.includes(item.id)
		)
	}

	public async moveItem(itemId: number, quantity: number) {
		try {
			let item: CharacterItem | BankItem | undefined = undefined
			if (quantity > 0) {
				item = await this.character.inventory.getItem(itemId)
				if (item) {
					const itemRes = await this.character.inventory.getItemByGid(item.gId)
					if (itemRes != null && (await this.canAddItem(itemRes, quantity))) {
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
			console.error(error)
		}
	}

	public async moveItems(items: CharacterItem[] | BankItem[]): Promise<void> {
		for (const item of items) {
			await this.moveItem(item.id, item.quantity)
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
				this.items.set(
					itemCuted.id,
					itemCuted.toBankItem(this.character.accountId)
				)

				await this.container
					.get(bankItemController)
					.createBankItem(
						itemCuted.toBankItem(this.character.accountId),
						this.character
					)
				await this.onItemAdded(itemCuted.toBankItem(this.character.accountId))
			}

			if (item.quantity >= 1) {
				await this.character.inventory.updateItem(item)
			}
		} catch (error) {
			console.error(error)
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

	public async addKamas(kamas: number) {
		try {
			this.kamas += kamas

			await this.container
				.get(UserController)
				.updateBankKamas(this.character.accountId, this.kamas)
		} catch (error) {
			console.error(error)
		}
	}

	public async moveKamas(quantity: number): Promise<void> {
		if (quantity < 0) {
			const absQuantity = Math.abs(quantity)
			if (this.character.account.bankKamas >= absQuantity) {
				await this.character.inventory.addKamas(absQuantity)
			} else {
				return // Not enough bank kamas to withdraw
			}
		} else {
			const isRemoved = await this.character.inventory.removeKamas(quantity)
			if (!isRemoved) {
				return // Not enough kamas to deposit
			}
		}

		this.character.account.bankKamas += quantity

		await this.container
			.get(UserController)
			.updateBankKamas(
				this.character.accountId,
				this.character.account.bankKamas
			)
		await this.character.client?.Send(
			new StorageKamasUpdateMessage(this.character.account.bankKamas)
		)
	}

	public async refresh() {
		try {
			const objectItems: ObjectItem[] = await this.getObjectsItems()

			await this.character.client?.Send(
				new StorageInventoryContentMessage(objectItems, this.kamas)
			)
		} catch (error) {
			console.error(error)
		}
	}

	public async onItemAdded(item: BankItem): Promise<void> {
		try {
			const itemObj = item.getObjectItem()
			await this.character.client.Send(new StorageObjectUpdateMessage(itemObj))
			await this.refresh()
		} catch (error) {
			console.error(error)
		}
	}

	public async onItemRemoved(item: BankItem): Promise<void> {
		try {
			await this.character.client.Send(new StorageObjectRemoveMessage(item.id))
			await this.container
				.get(bankItemController)
				.removeBankItem(this.character.accountId, item.id)
			await this.refresh()
		} catch (error) {
			console.error(error)
		}
	}

	public async onItemStacked(item: BankItem): Promise<void> {
		try {
			const itemObj = item.getObjectItem()
			await this.character.client.Send(new StorageObjectUpdateMessage(itemObj))
			await this.refresh()
		} catch (error) {
			console.error(error)
		}
	}

	public async onItemUnstacked(item: BankItem): Promise<void> {
		try {
			const itemObj = item.getObjectItem()
			await this.character.client.Send(new StorageObjectUpdateMessage(itemObj))
			await this.refresh()
		} catch (error) {
			console.error(error)
		}
	}

	public async onItemQuantityChanged(item: BankItem): Promise<void> {
		try {
			const itemObj = item.getObjectItem()
			await this.character.client.Send(new StorageObjectUpdateMessage(itemObj))
			await this.refresh()
		} catch (error) {
			console.error(error)
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
