import { Prisma } from "@prisma/client"
import Bank from "../../breakEmu_World/manager/items/Bank"
import Character from "../../breakEmu_API/model/character.model"
import Finishmoves from "../../breakEmu_API/model/finishmoves.model"
import Job from "../../breakEmu_API/model/job.model"
import GameMap from "../../breakEmu_API/model/map.model"
import Spell from "../../breakEmu_API/model/spell.model"
import AuthClient from "../../breakEmu_Auth/AuthClient"
import Logger from "../../breakEmu_Core/Logger"
import WorldClient from "../../breakEmu_World/WorldClient"
import BreedManager from "../../breakEmu_World/manager/breed/BreedManager"
import ContextEntityLook from "../../breakEmu_World/manager/entities/look/ContextEntityLook"
import EntityStats from "../../breakEmu_World/manager/entities/stats/entityStats"
import Inventory from "../../breakEmu_World/manager/items/Inventory"
import CharacterShortcut from "../../breakEmu_World/manager/shortcut/character/CharacterShortcut"
import Database from "../Database"
import Account from "../model/account.model"
import bankItemController from "./bankItem.controller"
import BaseController from "./base.controller"
import CharacterItemController from "./characterItem.controller"

class UserController extends BaseController {
	public _logger: Logger = new Logger("UserController")
	public _database: Database = Database.getInstance()

	constructor(client?: AuthClient) {
		super(client as AuthClient)
	}
	public initialize(): void {
		throw new Error("Method not implemented.")
	}

	async update(account: Account) {
		try {
			const user = await this._database.prisma.user.findUnique({
				where: {
					username: account.username,
				},
			})

			if (!user) {
				await this._logger.writeAsync(`User ${account.username} not found`)
				return
			}

			// await this._database.prisma.user.update({
			//   data: {

			//   }
			// })
		} catch (error) {
			await this._logger.writeAsync(
				`Error while updating account ${account.username}`
			)
		}
	}

	async getAccountByNickname(
		nickname: string,
		client: WorldClient
	): Promise<Account | undefined> {
		try {
			const acc = (await this._database.prisma.user.findUnique({
				where: {
					pseudo: nickname,
				},
			})) as Prisma.PromiseReturnType<
				typeof this._database.prisma.user.findUnique
			>

			if (!acc) {
				await this._logger.writeAsync(`User ${nickname} not found`)
				return
			}

			const account = new Account(
				acc.id,
				acc.username,
				acc.password,
				acc.pseudo as string,
				acc.email,
				acc.is_verified,
				acc.firstname,
				acc.lastname,
				acc.birthdate,
				acc.secretQuestion as string,
				acc.login_at as Date,
				acc.logout_at as Date,
				acc.created_at as Date,
				acc.updated_at as Date,
				acc.deleted_at as Date,
				acc.ip,
				acc.role,
				acc.is_banned,
				acc.tagNumber as number
			)

			const characters = await this._database.prisma.character.findMany({
				where: {
					userId: acc.id,
				},
			})

			for (const c of characters) {
				const look: ContextEntityLook = ContextEntityLook.parseFromString(
					c.look as string
				)

				const character = new Character(
					c.id,
					c.userId,
					BreedManager.getInstance().getBreedById(c.breed_id),
					c.sex,
					c.cosmeticId,
					c.name,
					Number(c.experience),
					look,
					Number(c.mapId),
					Number(c.cellId),
					c.direction,
					c.kamas,
					c.statsPoints,
					[],
					new Map<number, CharacterShortcut>(),
					[],
					0,
					Job.loadFromJson(JSON.parse(c.jobs?.toString() as string)),
					Finishmoves.loadFromJson(
						JSON.parse(c.finishMoves?.toString() as string)
					),
					GameMap.getMapById(Number(c.mapId)) as GameMap,
					EntityStats.loadFromJSON(JSON.parse(c.stats?.toString() as string))
				)
				character.client = client

				if (character.stats) {
					character.stats.client = client
				}

        character.account = account

        character.knownZaaps = Character.loadKnownZaapsFromJson(
          JSON.parse(c.knownZaaps?.toString() as string)
        )

				const shrts = Character.loadShortcutsFromJson(
					JSON.parse(c.shortcuts?.toString() as string)
				)

				character.generalShortcutBar.shortcuts = shrts.generalShortcuts
				character.spellShortcutBar.shortcuts = shrts.spellShortcuts

				character.spells = Spell.loadFromJson(
					JSON.parse(c.spells?.toString() as string),
					character
				)

				const items = await CharacterItemController.getInstance().getCharacterItemsByCharacterId(character.id)
        const bankItems = await bankItemController.getInstance().getBankItems(account.id)

				character.inventory = new Inventory(character, items)
        character.bank = new Bank(character, bankItems)

				account.characters.set(character.id, character)
			}

			return account
		} catch (error) {
			this._logger.error(
				`Error while getting account ${nickname} -> ${(error as any).stack}`
			)
			return
		}
	}
}

export default UserController
