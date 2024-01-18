import WorldClient from "../../breakEmu_World/WorldClient"
import Character from "../../breakEmu_API/model/character.model"
import AuthClient from "../../breakEmu_Auth/AuthClient"
import { ansiColorCodes } from "../../breakEmu_Core/Colors"
import Logger from "../../breakEmu_Core/Logger"
import BreedManager from "../../breakEmu_World/manager/breed/BreedManager"
import ContextEntityLook from "../../breakEmu_World/manager/entities/look/ContextEntityLook"
import EntityStats from "../../breakEmu_World/manager/entities/stats/entityStats"
import Database from "../Database"
import Account from "../model/account.model"
import BaseController from "./base.controller"
import { Prisma } from "@prisma/client"
import Job from "../../breakEmu_API/model/job.model"
import Spell from "../../breakEmu_API/model/spell.model"

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

	async getAccountByNickname(nickname: string): Promise<Account | undefined> {
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

			this._logger.writeAsync(`User ${acc.id} found`, ansiColorCodes.bgGreen)

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
				const validateColor = ContextEntityLook.verifyColors(
					c.colors.split(",").map(Number),
					c.sex,
					BreedManager.getInstance().getBreedById(c.breed_id)
				)

				const look: ContextEntityLook = BreedManager.getInstance().getBreedLook(
					c.breed_id,
					c.sex,
					c.cosmeticId,
					validateColor
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
					Character.loadShortcutsFromJson(JSON.parse(c.shortcuts?.toString() as string)),
					[],
					0,
          Job.loadFromJson(JSON.parse(c.jobs?.toString() as string)),
					EntityStats.loadFromJSON(JSON.parse(c.stats?.toString() as string))
				)

				account.characters.set(character.id, character)
			}

			this._logger.writeAsync(
				`Account ${account.pseudo} has ${account.characters.size} characters`,
				ansiColorCodes.bgCyan
			)

			return account
		} catch (error) {
			await this._logger.writeAsync(`Error while getting account ${nickname}`)
			return
		}
	}
}

export default UserController
