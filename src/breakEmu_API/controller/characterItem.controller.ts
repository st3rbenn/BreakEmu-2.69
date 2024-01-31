import Logger from "../../breakEmu_Core/Logger"
import Database from "../../breakEmu_API/Database"
import CharacterItem from "../model/characterItem.model"
import Effect from "../../breakEmu_World/manager/entities/effect/Effect"

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

	async createCharacterItemWithMapping(item: CharacterItem) {
		const characterItem = await this._database.prisma.characterItem.create({
			data: {
				uid: item.uId,
				characterId: item.characterId,
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
		const mapping = await this._database.prisma.characterItemIdMapper.findUnique(
			{
				where: { uuid },
			}
		)
		return mapping ? mapping.intId : null
	}

	async updateItem(item: CharacterItem) {
		await this._database.prisma.characterItem.update({
			where: { uid: item.uId },
			data: {
				position: item.position,
				quantity: item.quantity,
				look: item.look,
				effects: item.effects.saveAsJson(),
			},
		})
	}

  async cutItem(item: CharacterItem, quantity: number) {
    const newItem = item.clone()
    newItem.quantity = quantity
    item.quantity -= quantity
    return newItem
  }
}

export default CharacterItemController
