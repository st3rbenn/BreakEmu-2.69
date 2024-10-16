import { Prisma } from "@prisma/client"
import Character from "@breakEmu_API/model/character.model"
import Finishmoves from "@breakEmu_API/model/finishMoves.model"
import Job from "@breakEmu_API/model/job.model"
import GameMap from "@breakEmu_API/model/map.model"
import Spell from "@breakEmu_API/model/spell.model"
import AuthClient from "@breakEmu_Auth/AuthClient"
import Logger from "@breakEmu_Core/Logger"
import WorldClient from "@breakEmu_World/WorldClient"
import ContextEntityLook from "@breakEmu_World/manager/entities/look/ContextEntityLook"
import EntityStats from "@breakEmu_World/manager/entities/stats/entityStats"
import Bank from "@breakEmu_World/manager/items/Bank"
import Inventory from "@breakEmu_World/manager/items/Inventory"
import CharacterShortcut from "@breakEmu_World/manager/shortcut/character/CharacterShortcut"
import Database from "../Database"
import Account from "../model/account.model"
import bankItemController from "./bankItem.controller"
import BaseController from "./base.controller"
import CharacterItemController from "./characterItem.controller"
import Container from "@breakEmu_Core/container/Container"

class UserController extends BaseController {
	public _logger: Logger = new Logger("UserController")
	public container: Container = Container.getInstance()

	constructor(client?: AuthClient) {
		super(client as AuthClient)
	}
	public initialize(): void {
		throw new Error("Method not implemented.")
	}

	async update(account: Account) {
		try {
			const user = await this.database.prisma.user.findUnique({
				where: {
					username: account.username,
				},
			})

			if (!user) {
				await this._logger.writeAsync(`User ${account.username} not found`)
				return
			}

			// await this.database.prisma.user.update({
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
			const acc = (await this.database.prisma.user.findUnique({
				where: {
					pseudo: nickname,
				},
			})) as Prisma.PromiseReturnType<
				typeof this.database.prisma.user.findUnique
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
				acc.tagNumber as number,
				acc.bankKamas
			)

			const characters = await this.database.prisma.character.findMany({
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
					c.breed_id,
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
					c.knownEmotes?.toString().split(",").map(Number) || [],
					new Map<number, CharacterShortcut>(),
					c.knownOrnaments?.toString().split(",").map(Number) || [],
					c.knownTitles?.toString().split(",").map(Number) || [],
					c.activeOrnament as number,
					c.activeTitle as number,
					Job.loadFromJson(JSON.parse(c.jobs?.toString() as string)),
					Finishmoves.loadFromJson(
						JSON.parse(c.finishMoves?.toString() as string)
					),
					GameMap.getMapById(Number(c.mapId)) as GameMap,
					EntityStats.loadFromJSON(JSON.parse(c.stats?.toString() as string)),
					c.finishedAchievements?.toString().split(",").map(Number) || [],
					c.almostFinishedAchievements?.toString().split(",").map(Number) || [],
					c.finishedAchievementObjectives?.toString().split(",").map(Number) ||
						[],
					c.untakenAchievementsReward?.toString().split(",").map(Number) || []
				)
				character.client = client
				character.stats.initialize(client)

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

				const items = await this.container
					.get(CharacterItemController)
					.getCharacterItemsByCharacterId(character.id)
				const bankItems = await this.container
					.get(bankItemController)
					.getBankItems(character.accountId, character.id)

				character.inventory = new Inventory(character, items)
				character.bank = new Bank(character, bankItems, acc.bankKamas)

				account.characters.set(character.id, character)
			}

			return account
		} catch (error) {
			this._logger.error(
				`Error while getting account ${nickname}`,
				error as any
			)
			return
		}
	}

	async updateBankKamas(accountId: number, kamas: number) {
		try {
			await this.database.prisma.user.update({
				where: {
					id: accountId,
				},
				data: {
					bankKamas: kamas,
				},
			})
		} catch (error) {
			this._logger.error("Error while updating bank kamas", error as any)
		}
	}
}

export default UserController
