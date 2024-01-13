import ConfigurationManager from "../../breakEmu_Core/configuration/ConfigurationManager"
import Account from "../../breakEmu_API/model/account.model"
import Experience from "../../breakEmu_API/model/experience.model"
import Logger from "../../breakEmu_Core/Logger"
import { CharacterCreationRequestMessage } from "../../breakEmu_Server/IO"
import CharacterCreationResultEnum from "../../breakEmu_World/enum/CharacterCreationResultEnum"
import BreedManager from "../../breakEmu_World/manager/breed/BreedManager"
import ContextEntityLook from "../../breakEmu_World/manager/entities/look/ContextEntityLook"
import EntityStats from "../../breakEmu_World/manager/entities/stats/entityStats"
import Database from "../Database"
import Character from "../model/character.model"
import { PrismaClient } from "@prisma/client"

class CharacterController {
	public _logger: Logger = new Logger("CharacterController")
	public _database: Database = Database.getInstance()

	private static _instance: CharacterController

	private NAME_REGEX: RegExp = /^[A-Z][a-z]{2,9}(?:-[A-Za-z][a-z]{2,9}|[a-z]{1,10})$/

	MaxCharacterSlots: number = 5

	constructor() {}

	public static getInstance(): CharacterController {
		if (!CharacterController._instance) {
			CharacterController._instance = new CharacterController()
		}

		return CharacterController._instance
	}

	public async getCharactersByAccountId(
		accountId: number
	): Promise<Character[] | undefined> {
		try {
			const characters = await this._database.prisma.character.findMany({
				where: {
					userId: accountId,
				},
			})

			let charactersList: Character[] = []

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
					[],
					[],
					0,
          EntityStats.loadFromJSON(JSON.parse(c.stats?.toString() as string))
				)

        charactersList.push(character)
			}

			return charactersList
		} catch (error) {
			await this._logger.writeAsync(
				`Error while getting characters for account ${accountId} \n ${error}`
			)
		}
	}

	public async getCharacterByName(name: string) {}

	public async createCharacter(
		message: CharacterCreationRequestMessage,
		account: Account,
		failureCallback: (reason: CharacterCreationResultEnum) => void,
		successCallback: (character: Character) => void
	): Promise<any> {
		try {
			const characters = account.characters

			if (characters && characters.size >= this.MaxCharacterSlots) {
				await this._logger.writeAsync(
					`Error while creating character: too many characters`
				)
				return failureCallback(
					CharacterCreationResultEnum.ERR_TOO_MANY_CHARACTERS
				)
			}

			const characterWithSameName = await this._database.prisma.character.findFirst(
				{
					where: {
						name: message.name,
					},
				}
			)

			if (characterWithSameName) {
				await this._logger.writeAsync(
					`Error while creating character: character with same name already exists: ${message.name}`
				)
				return failureCallback(CharacterCreationResultEnum.ERR_INVALID_NAME)
			}

			if (!this.NAME_REGEX.test(message.name as string)) {
				await this._logger.writeAsync(
					`Error while creating character: invalid name: ${message.name}`
				)
				return failureCallback(CharacterCreationResultEnum.ERR_INVALID_NAME)
			}

			const verifiedColors = ContextEntityLook.verifyColors(
				message.colors as number[],
				message.sex as boolean,
				BreedManager.getInstance().getBreedById(message.breed as number)
			)

			const look: ContextEntityLook = BreedManager.getInstance().getBreedLook(
				message.breed as number,
				message.sex as boolean,
				message.cosmeticId as number,
				verifiedColors
			)

			const startLevel = ConfigurationManager.getInstance().startLevel
			const startLevelExp = Experience.getCharacterExperienceLevelFloor(
				startLevel - 1
			)

			const newCharacter = await this._database.prisma.character.create({
				data: {
					userId: account.id as number,
					name: message.name as string,
					breed_id: message.breed as number,
					colors: this.serializeColors(message.colors as number[]),
					cosmeticId: message.cosmeticId as number,
					sex: message.sex as boolean,
					experience: startLevelExp,
					look: ContextEntityLook.convertToString(look),
					cellId: ConfigurationManager.getInstance().startCellId.toString(),
					mapId: ConfigurationManager.getInstance().startMapId.toString(),
					direction: 1,
					kamas: ConfigurationManager.getInstance().startKamas,
					statsPoints: ConfigurationManager.getInstance().startStatsPoints,
					stats: JSON.stringify(EntityStats.new(startLevel).saveAsJSON()),
				},
			})

			const character = Character.create(
				newCharacter.id,
				account.id,
				newCharacter.breed_id,
				newCharacter.sex,
				newCharacter.cosmeticId,
				newCharacter.name,
				look,
				ConfigurationManager.getInstance().startMapId,
				ConfigurationManager.getInstance().startCellId,
				newCharacter.direction,
				newCharacter.kamas
			)

			return successCallback(character)
		} catch (error) {
			this._logger.write(`Error while creating character: ${error}`)
			return failureCallback(CharacterCreationResultEnum.ERR_NO_REASON)
		}
	}

	public async deleteCharacter(characterId: number, accountId: number) {
		try {
			const character = await this._database.prisma.character.findFirst({
				where: {
					id: characterId,
					userId: accountId,
				},
			})

			if (!character) {
				return false
			}

			await this._database.prisma.character.delete({
				where: {
					id: characterId,
				},
			})

			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	private parseColors(colors: string): number[] {
		return colors.split(",").map((color) => parseInt(color))
	}

	private serializeColors(colors: number[]): string {
		return colors.join(",")
	}
}

export default CharacterController
