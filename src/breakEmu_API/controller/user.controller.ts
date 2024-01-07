import Breed from "../../breakEmu_API/model/breed.model"
import Character from "../../breakEmu_API/model/character.model"
import AuthClient from "../../breakEmu_Auth/AuthClient"
import { ansiColorCodes } from "../../breakEmu_Core/Colors"
import Logger from "../../breakEmu_Core/Logger"
import ContextEntityLook from "../../breakEmu_World/model/entities/look/ContextEntityLook"
import Database from "../Database"
import Account from "../model/account.model"
import BaseController from "./base.controller"

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

	async getAccountByNickname(nickname: string): Promise<Account | null> {
		try {
			const user = await this._database.prisma.user.findUnique({
				where: {
					pseudo: nickname,
				},
			})

			if (!user) {
				await this._logger.writeAsync(`User ${nickname} not found`)
				return null
			}

			this._logger.writeAsync(`User ${nickname} found`, ansiColorCodes.bgGreen)

			const characters = await this._database.prisma.character.findMany({
				where: {
					userId: user.id,
				},
			})

			const account = new Account(
				user.id,
				user.username,
				user.password,
				user.pseudo as string,
				user.email,
				user.is_verified,
				user.firstname,
				user.lastname,
				user.birthdate,
				user.secretQuestion as string,
				user.login_at as Date,
				user.logout_at as Date,
				user.created_at as Date,
				user.updated_at as Date,
				user.deleted_at as Date,
				user.ip,
				user.role,
				user.is_banned,
				user.tagNumber as number
			)

			for (const c of characters) {
				const validateColor = ContextEntityLook.verifyColors(
					c.colors.split(",").map(Number),
					c.sex,
					Breed.getBreedById(c.breed_id)
				)

				const look: ContextEntityLook = Breed.getBreedLook(
					c.breed_id,
					c.sex,
					c.cosmeticId,
					validateColor
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
					c.cellId,
					c.direction,
					c.kamas,
					c.strength,
					c.vitality,
					c.wisdom,
					c.chance,
					c.agility,
					c.intelligence,
					c.alignementSide,
					c.alignementValue,
					c.alignementGrade,
					c.characterPower,
					c.honor,
					c.dishonor,
					c.energy,
					c.aggressable ? 1 : 0
				)

				account.characters.set(character.id, character)
			}

			return account
		} catch (error) {
			await this._logger.writeAsync(`Error while getting account ${nickname}`)
			return null
		}
	}
}

export default UserController
