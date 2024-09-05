import Database from "@breakEmu_API/Database"
import CharacterItem from "@breakEmu_API/model/characterItem.model"
import Container from "@breakEmu_Core/container/Container"
import Logger from "@breakEmu_Core/Logger"
import { CharacterInventoryPositionEnum } from "@breakEmu_Protocol/IO"
import Effect from "@breakEmu_World/manager/entities/effect/Effect"
import EffectCollection from "@breakEmu_World/manager/entities/effect/EffectCollection"
import EffectInteger from "@breakEmu_World/manager/entities/effect/EffectInteger"
import AbstractItem from "@breakEmu_World/manager/items/AbstractItem"

class CharacterItemController {
	public _logger: Logger = new Logger("CharacterItemController")
	private container: Container = Container.getInstance()
	public _database: Database = this.container.get(Database)

	async createCharacterItem(item: AbstractItem, characterId: number) {
		const characterItemFromDB = await this._database.prisma.characterItem.create(
			{
				data: {
					characterId: characterId,
					appearanceId: item.appearanceId,
					gid: item.gId,
					position: item.position,
					quantity: item.quantity,
					look: item.look,
					effects: item.effects.saveAsJson(),
				},
			}
		)

		if (characterItemFromDB) {
			let effects: EffectCollection = new EffectCollection([])
			const effs = JSON.parse(
				characterItemFromDB.effects?.toString() as string
			) as Effect[]

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
			const characterItem = new CharacterItem(
				characterId,
				characterItemFromDB.gid,
				characterItemFromDB.quantity,
				characterItemFromDB.position,
				characterItemFromDB.look || "",
				effects,
				characterItemFromDB.appearanceId
			)

			characterItem.id = characterItemFromDB.id

			return characterItem
		}

		return null
	}

	async getCharacterItemByGid(characterId: number, gid: number) {
		console.log(`getCharacterItemByGid: ${characterId} ${gid}`)
		const characterItem = await this._database.prisma.characterItem.findFirst({
			where: {
				characterId,
				gid,
			},
		})

		return characterItem
	}

	async getCharacterItemsByCharacterId(characterId: number) {
		const characterItems = await this._database.prisma.characterItem.findMany({
			where: {
				characterId,
			},
		})

		let characterItemsArray: CharacterItem[] = []

		for (const item of characterItems) {
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

			const characterItem = new CharacterItem(
				characterId,
				item.gid,
				item.quantity,
				item.position,
				item.look || "",
				effects,
				item.appearanceId
			)

      characterItem.id = item.id

			characterItemsArray.push(characterItem)
		}

		return characterItemsArray
	}

	async updateItem(item: CharacterItem) {
		try {
			console.log(`updateItem: ${item.id} - ${item.record.name}`)
			const existingItem = await this._database.prisma.characterItem.findUnique(
				{
					where: { id: item.id },
				}
			)

			if (!existingItem) {
				throw new Error(`Item with uId ${item.id} not found`)
			}

			await this._database.prisma.characterItem.update({
				where: {
					id: item.id,
				},
				data: {
					appearanceId: item.appearanceId,
					gid: item.gId,
					position: item.position,
					quantity: item.quantity,
					look: item.look,
					effects: item.effects.saveAsJson(),
				},
			})
		} catch (error) {
			this._logger.error(
				`Error updating item ${item.id} ${item.record.name} \n ${error}`
			)
		}
	}

	async cutItem(
		item: CharacterItem,
		quantity: number,
		newPos: CharacterInventoryPositionEnum
	) {
		const newItem = item.clone()
		item.position = newPos
		item.quantity -= quantity
		newItem.quantity = quantity
		return newItem
	}

	async deleteItem(item: CharacterItem) {
		try {
			const getUid = await this.getCharacterItemByGid(
				item.characterId,
				item.gId
			)
			if (getUid) {
				await this._database.prisma.characterItem.delete({
					where: { id: getUid.id, characterId: item.characterId },
				})
			}
		} catch (error) {
			this._logger.error(`Error deleting item ${item.id} ${item.record.name}`)
		}
	}
}

export default CharacterItemController
