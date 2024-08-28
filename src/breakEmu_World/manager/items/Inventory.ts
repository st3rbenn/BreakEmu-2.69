import { randomUUID } from "crypto"
import CharacterController from "@breakEmu_API/controller/character.controller"
import CharacterItemController from "@breakEmu_API/controller/characterItem.controller"
import Character from "@breakEmu_API/model/character.model"
import CharacterItem from "@breakEmu_API/model/characterItem.model"
import Item from "@breakEmu_API/model/item.model"
import ItemSet from "@breakEmu_API/model/itemSet.model"
import {
	CharacterInventoryPositionEnum,
	EffectsEnum,
	InventoryContentMessage,
	InventoryWeightMessage,
	KamasUpdateMessage,
	ObjectAddedMessage,
	ObjectEffect,
	ObjectErrorEnum,
	ObjectErrorMessage,
	ObjectItem,
	ObjectMovementMessage,
	ObjectQuantityMessage,
	SetUpdateMessage,
} from "@breakEmu_Protocol/IO"
import ItemEffectsManager from "../effect/ItemEffectsManager"
import ItemCollection from "./collections/ItemCollections"
import Logger from "@breakEmu_Core/Logger"

class Inventory extends ItemCollection<CharacterItem> {
	public maxKamas: number = 2000000000
	public itemCastEffect: EffectsEnum = EffectsEnum.Effect_CastSpell_1175

	private logger: Logger
	private character: Character
	public _currentWeight: number = 0
	public hasWeaponEquiped: boolean = this.getWeapon() !== null
	full: boolean = false

	constructor(character: Character, items: CharacterItem[] = []) {
		super(items)
		this.character = character

		this.logger = new Logger(`Inventory-${this.character?.name}`)
	}

	public _isChangingStuff: boolean = false

	public get isChangingStuff(): boolean {
		return this._isChangingStuff
	}

	public set isChangingStuff(value: boolean) {
		this._isChangingStuff = value
	}

	public dofusPositions: CharacterInventoryPositionEnum[] = [
		CharacterInventoryPositionEnum.INVENTORY_POSITION_DOFUS_1,
		CharacterInventoryPositionEnum.INVENTORY_POSITION_DOFUS_2,
		CharacterInventoryPositionEnum.INVENTORY_POSITION_DOFUS_3,
		CharacterInventoryPositionEnum.INVENTORY_POSITION_DOFUS_4,
		CharacterInventoryPositionEnum.INVENTORY_POSITION_DOFUS_5,
		CharacterInventoryPositionEnum.INVENTORY_POSITION_DOFUS_6,
	]

	public ringPositions: CharacterInventoryPositionEnum[] = [
		CharacterInventoryPositionEnum.INVENTORY_POSITION_RING_LEFT,
		CharacterInventoryPositionEnum.INVENTORY_POSITION_RING_RIGHT,
	]

	public get currentWeight(): number {
		let weight: number = 0
		this.items.forEach((item) => {
			weight += item.record.realWeight * item.quantity
		})

		return weight
	}

	public async getItemByGid(gid: number): Promise<CharacterItem | null> {
		for (const [key, item] of this.items) {
			if (item.gId == gid) {
				return item
			}
		}

		return null
	}

	public getWeapon(): CharacterItem | null {
		return this.getEquipedItem(
			CharacterInventoryPositionEnum.ACCESSORY_POSITION_WEAPON
		)
	}

	public getEquipedItem(
		position: CharacterInventoryPositionEnum
	): CharacterItem | null {
		for (const [key, item] of this.items) {
			if (item.positionEnum === position) {
				return item
			}
		}

		return null
	}

	public async refresh() {
		try {
			const objectItems: ObjectItem[] = await this.getObjectsItems()

			await this.character.client?.Send(
				new InventoryContentMessage(objectItems, this.character.kamas)
			)

			await this.refreshWeight()
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async refreshKamas() {
		try {
			await this.character.client?.Send(
				new KamasUpdateMessage(this.character.kamas)
			)
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async refreshWeight() {
		try {
			await this.character.client?.Send(
				new InventoryWeightMessage(
					this.currentWeight,
					this.character.stats?.currentMaxWeight
				)
			)
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async addKamas(kamas: number) {
		try {
			if (this.character.kamas + kamas > this.maxKamas) {
				this.character.kamas = this.maxKamas
			} else {
				this.character.kamas += kamas
			}

			await this.refreshKamas()
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async addNewItem(
		gid: number,
		quantity: number = 1,
		perfect: boolean = false
	) {
		try {
			let template = Item.getItem(gid)

			if (template !== null) {
				if (
					this.currentWeight + template.realWeight * quantity >
					(this.character.stats?.currentMaxWeight as number)
				) {
					this.character.inventory.full = true
					await this.onError(ObjectErrorEnum.INVENTORY_FULL)
					return
				}

				const obj = new CharacterItem(
					this.character.id,
					randomUUID(),
					gid,
					quantity,
					CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED,
					"",
					template.effects.generate(perfect),
					template.appearanceId
				)

				await this.addItem(obj, quantity, this.character.id)
				return obj
			} else {
				console.log(`Item with gid ${gid} not found`)
				return null
			}
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async setItemPosition(
		item: CharacterItem,
		position: CharacterInventoryPositionEnum,
		quantity: number
	) {
		try {
			this._isChangingStuff = true
			if (
				position !=
				CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
			) {
				if (this.character.level < item.record.level) {
					await this.onError(ObjectErrorEnum.LEVEL_TOO_LOW)
					return
				}

				//TODO: Check Item Criteria

				if (
					item.positionEnum ==
						CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED &&
					this.dofusPositions.includes(item.position) &&
					this.dofusPositions.includes(position)
				) {
					return
				}

				if (
					this.checkStacks(item, position, this.ringPositions) &&
					item.hasSet()
				) {
					await this.onError(ObjectErrorEnum.CANNOT_EQUIP_HERE)
					return
				}

				if (
					this.checkStacks(item, position, this.dofusPositions) &&
					item.positionEnum ==
						CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
				) {
					await this.onError(ObjectErrorEnum.CANNOT_EQUIP_HERE)
					return
				}

				if (!this.isChangingStuff) {
					await this.character.replyError(
						"Vous êtes en train de changer d'équipement, veuillez patienter"
					)
					return
				}

				await this.equipItem(item, position, quantity)
			} else {
				if (
					item.positionEnum ==
					CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
				) {
					await this.onError(ObjectErrorEnum.CANNOT_EQUIP_HERE)
					return
				} else {
					await this.unequipItem(item, quantity)
				}
			}

			await item.save()
			await this.onObjectMoved(item, position)
			await this.refreshWeight()
			await CharacterController.getInstance().updateCharacter(this.character)
			await this.character.refreshActorOnMap()
			await this.character.refreshStats()

			this._isChangingStuff = false
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async equipItem(
		item: CharacterItem,
		position: CharacterInventoryPositionEnum,
		quantity: number = 1
	) {
		try {
			const alreadyEquiped = this.getEquipedItem(position)
			const lastPosition = item.positionEnum

			if (alreadyEquiped != null) {
				await this.unequipItem(alreadyEquiped, quantity)
				await this.onObjectMoved(
					alreadyEquiped,
					CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
				)
			}

			if (item.quantity == 1) {
				item.positionEnum = position
			} else {
				const newItem = await CharacterItemController.getInstance().cutItem(
					item,
					quantity
				)

				if (newItem != null) {
					newItem.positionEnum = position
					await this.addItem(newItem, quantity, item.characterId)
					await this.updateItemQuantity(item)
				}
			}

			await item.save()
			await this.onItemMoved(item, lastPosition)

			// let equipedItems = await this.getEquipedItems()
			// for (const equipedItem of equipedItems) {
			// 	if (equipedItem.gId != item.gId) {
			// 		await this.setItemPosition(
			// 			equipedItem,
			// 			CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED,
			// 			equipedItem.quantity
			// 		)
			// 	}
			// }
		} catch (error) {
			console.log(error as any)
		}
	}

	public async getEquipedItems(): Promise<CharacterItem[]> {
		let equipedItems: CharacterItem[] = []

		for (const [key, item] of this.items) {
			if (item.isEquiped()) {
				equipedItems.push(item)
			}
		}

		return equipedItems
	}

	public async unequipItem(item: CharacterItem, quantity: number) {
		try {
			if (
				item.positionEnum !=
				CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
			) {
				const sameItem = await this.getSameItem(item)
				const lastPosition = item.positionEnum

				if (sameItem != null) {
					if (item.uId != sameItem.uId) {
						item.positionEnum =
							CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
						sameItem.quantity += quantity
						await CharacterItemController.getInstance().updateItem(sameItem)
						await this.updateItemQuantity(sameItem)
						await this.removeItem(item, item.quantity)
					} else {
						item.positionEnum =
							CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
						await CharacterItemController.getInstance().updateItem(item)
					}
				} else {
					item.positionEnum =
						CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
					await CharacterItemController.getInstance().updateItem(item)
				}

				await this.onItemMoved(item, lastPosition)
			}
		} catch (error) {
			console.log(error as any)
		}
	}

	public async cutItem(item: CharacterItem, quantity: number) {
		try {
			const newItem = item.clone()
			newItem.quantity = quantity
			item.quantity -= quantity
			return newItem
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async updateItemQuantity(item: CharacterItem) {
		try {
			const itemuId = await CharacterItemController.getInstance().getIntIdFromUuid(
				item.uId
			)
			await this.character.client?.Send(
				new ObjectQuantityMessage(itemuId as number, item.quantity)
			)
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onItemMoved(
		item: CharacterItem,
		lastPosition: CharacterInventoryPositionEnum
	) {
		try {
			const flag =
				lastPosition !=
				CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
			const flag2 = item.isEquiped()

			if (flag2 && !flag) {
				await ItemEffectsManager.getInstance().addEffects(
					this.character,
					item.effects
				)
			}

			if (!flag2 && flag) {
				await ItemEffectsManager.getInstance().removeEffects(
					this.character,
					item.effects
				)
			}

			await this.updateLook(item, flag2)

			if (item.record.hasSet) {
				const itemSetEquiped = await this.countItemSetEquiped(item)

				if (flag2) {
					await this.applyItemSetEffects(
						item.record.itemSet as ItemSet,
						itemSetEquiped,
						flag2
					)
				} else {
					await this.applyItemSetEffects(
						item.record.itemSet as ItemSet,
						itemSetEquiped,
						flag2
					)
				}
			}
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async applyItemSetEffects(
		itemSet: ItemSet,
		count: number,
		equipped: boolean
	): Promise<void> {
		try {
			if (equipped && count >= 2) {
				if (count >= 3) {
					console.log(`itemSet Equiped and count >= 3`)
					await ItemEffectsManager.getInstance().removeEffects(
						this.character,
						itemSet.getEffects(count - 1)
					)
				}

				console.log(`itemSet Equiped and count >= 2`)

				await ItemEffectsManager.getInstance().addEffects(
					this.character,
					itemSet.getEffects(count)
				)
			} else if (!equipped && count >= 1) {
				console.log(`itemSet not Equiped and count >= 1`)
				await ItemEffectsManager.getInstance().removeEffects(
					this.character,
					itemSet.getEffects(count + 1)
				)

				if (count >= 2) {
					await ItemEffectsManager.getInstance().addEffects(
						this.character,
						itemSet.getEffects(count)
					)
				}
			}

			if ((equipped && count >= 2) || (!equipped && count >= 1)) {
				await this.onSetUpdated(itemSet, count)
			}
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async countItemSetEquiped(itemSet: CharacterItem): Promise<number> {
		let count = 0

		for (const item of await this.getEquipedItems()) {
			if (item.hasSet() && itemSet.record.itemSetid == item.record.itemSetid) {
				count++
			}
		}

		return count
	}

	public async updateLook(item: CharacterItem, equiped: boolean) {
		const itemType = Item.getItem(item.gId).typeEnum
		switch (itemType) {
			default:
				if (item.appearanceId != 0) {
					if (equiped) {
						this.character.look.addSkin(item.appearanceId)
					} else {
						this.character.look.removeSkin(item.appearanceId)
					}
				}
				break
		}
	}

	public async onError(error: ObjectErrorEnum) {
		try {
			await this.character.client?.Send(new ObjectErrorMessage(error))
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public checkStacks(
		item: CharacterItem,
		position: CharacterInventoryPositionEnum,
		checker: CharacterInventoryPositionEnum[]
	): boolean {
		checker.forEach(async (pos) => {
			const equipedItem = this.getEquipedItem(pos)
			if (equipedItem != null && equipedItem.gId == item.gId) {
				return true
			}
		})

		return false
	}

	public async updateItem(item: CharacterItem) {
		try {
			await CharacterItemController.getInstance().updateItem(item)
			await this.refresh()
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onSetUpdated(itemSet: ItemSet, count: number) {
		try {
			const allItemsSetId = Array.from(itemSet.items.keys())
			const objectEffects = itemSet.getEffects(count).getObjectEffects()

			await this.character.client?.Send(
				new SetUpdateMessage(itemSet.id, allItemsSetId, objectEffects)
			)
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onObjectMoved(
		item: CharacterItem,
		newPosition: CharacterInventoryPositionEnum
	) {
		try {
			const itemuId = await CharacterItemController.getInstance().getIntIdFromUuid(
				item.uId
			)
			await this.character.client?.Send(
				new ObjectMovementMessage(itemuId as number, newPosition)
			)
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onItemAdded(item: CharacterItem): Promise<void> {
		try {
			const it = await item.getObjectItem()
			await this.character.client?.Send(new ObjectAddedMessage(it, 0))
			await this.refreshWeight()
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onItemsAdded(items: CharacterItem[]): Promise<void> {
		try {
			for (const item of items) {
				await this.onItemAdded(item)
			}

			await this.refreshWeight()
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onItemStacked(item: CharacterItem): Promise<void> {
		try {
			await item.save()
			await this.updateItemQuantity(item)
			await this.refreshWeight()
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onItemsStackeds(items: CharacterItem[]): Promise<void> {
		try {
			for (const item of items) {
				await this.onItemStacked(item)
			}
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onItemRemoved(item: CharacterItem): Promise<void> {
		try {
			const itemUid = await CharacterItemController.getInstance().getIntIdFromUuid(
				item.uId
			)
			await this.character.client?.Send(
				new ObjectMovementMessage(itemUid as number, -1)
			)

			await CharacterItemController.getInstance().deleteItem(item)
			await this.refreshWeight()
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onItemsRemoved(items: CharacterItem[]): Promise<void> {
		try {
			for (const item of items) {
				await this.onItemRemoved(item)
			}

			await this.refreshWeight()
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onItemUnstacked(item: CharacterItem): Promise<void> {
		try {
			await item.save()
			await this.updateItemQuantity(item)
			await this.refreshWeight()
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onItemsUnstackeds(items: CharacterItem[]): Promise<void> {
		try {
			for (const item of items) {
				await this.onItemUnstacked(item)
			}
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onItemQuantityChanged(item: CharacterItem): Promise<void> {
		try {
			await item.save()
			await this.updateItemQuantity(item)
			await this.refreshWeight()
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	public async onItemsQuantityChanged(items: CharacterItem[]): Promise<void> {
		try {
			for (const item of items) {
				await item.save()
				await this.updateItemQuantity(item)
			}
		} catch (error) {
			this.logger.write(error as any)
		}
	}

	// public async save() {
	//   try {
	//     for (const [key, item] of this.items) {
	//       await CharacterItemController.getInstance().updateItem(item)
	//     }
	//   } catch (error) {
	//     this.logger.write(error as any)
	//   }
	// }
}

export default Inventory
