import { randomUUID } from "crypto"
import Database from "@breakEmu_API/Database"
import Logger from "@breakEmu_Core/Logger"
import Effect from "@breakEmu_World/manager/entities/effect/Effect"
import EffectCollection from "@breakEmu_World/manager/entities/effect/EffectCollection"
import EffectInteger from "@breakEmu_World/manager/entities/effect/EffectInteger"
import AbstractItem from "@breakEmu_World/manager/items/AbstractItem"
import CharacterItem from "../model/characterItem.model"

class CharacterItemController {
	public _logger: Logger = new Logger("CharacterItemController")
	public _database: Database = Database.getInstance()

	private static _instance: CharacterItemController

	public static getInstance(): CharacterItemController {
		if (!CharacterItemController._instance) {
			CharacterItemController._instance = new CharacterItemController()
		}

		return CharacterItemController._instance
	}

	async createCharacterItemWithMapping(
		item: AbstractItem,
		characterId: number
	) {
		const characterItem = await this._database.prisma.characterItem.create({
			data: {
				characterId: characterId,
				appearanceId: item.appearanceId,
				gid: item.gId,
				position: item.position,
				quantity: item.quantity,
				look: item.look,
				effects: item.effects.saveAsJson(),
			},
		})

		const idMapping = await this._database.prisma.characterItemIdMapper.create({
			data: {
				uuid: characterItem.uid,
			},
		})

		return { characterItem, idMapping }
	}

	async getIntIdFromUuid(uuid: string) {
		try {
			const mapping = await this._database.prisma.characterItemIdMapper.findUnique(
				{
					where: { uuid },
				}
			)
			return mapping ? mapping.intId : null
		} catch (error) {
			this._logger.error(`Error getting intId from uuid ${uuid}`)
		}
	}

	async getUuidFromIntId(intId: number) {
		try {
			const mapping = await this._database.prisma.characterItemIdMapper.findUnique(
				{
					where: { intId },
				}
			)
			if (mapping) {
				return mapping.uuid
			} else {
				await this._database.prisma.characterItemIdMapper.create({
					data: {
						intId,
						uuid: randomUUID(),
					},
				})
			}
		} catch (error) {
			this._logger.error(`Error getting uuid from intId ${intId}`)
		}
	}

	async getCharacterItemByGid(characterId: number, gid: number) {
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

			characterItemsArray.push(
				new CharacterItem(
					characterId,
					item.uid,
					item.gid,
					item.quantity,
					item.position,
					item.look || "",
					effects,
					item.appearanceId
				)
			)
		}

		return characterItemsArray
	}

	async updateItem(item: CharacterItem) {
		const getUid = await this.getCharacterItemByGid(item.characterId, item.gId)

		if (getUid) {
			try {
				await this._database.prisma.characterItem.update({
					where: {
						uid: getUid.uid,
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
					`Error updating item ${item.uId} ${item.record.name}`
				)
			}
		}
	}

	async cutItem(item: CharacterItem, quantity: number) {
		const newItem = item.clone()
		newItem.quantity = quantity
		item.quantity -= quantity
		return newItem
	}

	async deleteItem(item: CharacterItem) {
		try {
			const getUid = await this.getCharacterItemByGid(
				item.characterId,
				item.gId
			)
			await this._database.prisma.characterItem.delete({
				where: { uid: getUid?.uid as string },
			})
		} catch (error) {
			this._logger.error(`Error deleting item ${item.uId} ${item.record.name}`)
		}
	}
}

export default CharacterItemController
