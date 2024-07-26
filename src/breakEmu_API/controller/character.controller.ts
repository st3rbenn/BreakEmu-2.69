import Account from "../../breakEmu_API/model/account.model"
import Experience from "../../breakEmu_API/model/experience.model"
import Finishmoves from "../../breakEmu_API/model/finishmoves.model"
import Job from "../../breakEmu_API/model/job.model"
import GameMap from "../../breakEmu_API/model/map.model"
import Spell from "../../breakEmu_API/model/spell.model"
import Logger from "../../breakEmu_Core/Logger"
import ConfigurationManager from "../../breakEmu_Core/configuration/ConfigurationManager"
import { CharacterCreationRequestMessage } from "../../breakEmu_Server/IO"
import CharacterCreationResultEnum from "../../breakEmu_World/enum/CharacterCreationResultEnum"
import BreedManager from "../../breakEmu_World/manager/breed/BreedManager"
import ContextEntityLook from "../../breakEmu_World/manager/entities/look/ContextEntityLook"
import EntityStats from "../../breakEmu_World/manager/entities/stats/entityStats"
import CharacterShortcut from "../../breakEmu_World/manager/shortcut/character/CharacterShortcut"
import Database from "../Database"
import Character from "../model/character.model"

class CharacterController {
	public _logger: Logger = new Logger("CharacterController")
	public database: Database = Database.getInstance()

	private static _instance: CharacterController

	private NAME_REGEX: RegExp = /^[A-Z][a-z]{2,9}(?:-[A-Za-z][a-z]{2,9}|[a-z]{1,10})$/

	MaxCharacterSlots: number = 5

	public static getInstance(): CharacterController {
		if (!this._instance) {
			console.log("Creating new instance of CharacterController")
			this._instance = new CharacterController()
		}

		return this._instance
	}

	public async getCharactersByAccountId(
		accountId: number
	): Promise<Character[] | undefined> {
		try {
			const characters = await this.database.prisma.character.findMany({
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
					[],
					new Map<number, CharacterShortcut>(),
					[],
					0,
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

				character.spawnMapId = c.spawnMapId
				character.spawnCellId = c.spawnCellId

				const shrts = Character.loadShortcutsFromJson(
					JSON.parse(c.shortcuts?.toString() as string)
				)

				character.generalShortcutBar.shortcuts = shrts.generalShortcuts
				character.spellShortcutBar.shortcuts = shrts.spellShortcuts

				character.spells = Spell.loadFromJson(
					JSON.parse(c.spells?.toString() as string),
					character
				)

				charactersList.push(character)
			}

			return charactersList
		} catch (error) {
			await this._logger.writeAsync(
				`Error while getting characters for account ${accountId} \n ${
					(error as any).stack
				}`
			)
		}
	}

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

			const characterWithSameName = await this.database.prisma.character.findFirst(
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

			const startLevel = Experience.experiences.get(
				ConfigurationManager.getInstance().startLevel
			) as Experience

			let jobs: Job[] = []

			// Job.new().forEach((job) => {
			// 	jobs.push(job)
			// })

			const stats = EntityStats.new(startLevel.level)
			stats.saveAsJSON()

			const newCharacter = await this.database.prisma.character.create({
				data: {
					userId: account.id as number,
					name: message.name as string,
					breed_id: message.breed as number,
					colors: this.serializeColors(message.colors as number[]),
					cosmeticId: message.cosmeticId as number,
					sex: message.sex as boolean,
					experience: startLevel.characterExp,
					look: ContextEntityLook.convertToString(look),
					cellId: ConfigurationManager.getInstance().startCellId.toString(),
					mapId: ConfigurationManager.getInstance().startMapId.toString(),
					direction: 1,
					kamas: ConfigurationManager.getInstance().startKamas,
					statsPoints: ConfigurationManager.getInstance().startStatsPoints,
					stats: JSON.stringify(stats),
					jobs: JSON.stringify(jobs),
					shortcuts: JSON.stringify([]),
					knownZaaps: JSON.stringify([]),
				},
			})

			const character = await Character.create(
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
				newCharacter.kamas,
				Finishmoves.getFinishmovesByFree(true),
				startLevel,
				stats
			)

			return successCallback(character)
		} catch (error) {
			this._logger.write(
				`Error while creating character: ${(error as any).stack}`
			)
			return failureCallback(CharacterCreationResultEnum.ERR_NO_REASON)
		}
	}

	public async deleteCharacter(characterId: number, accountId: number) {
		try {
			const character = await this.database.prisma.character.findFirst({
				where: {
					id: characterId,
					userId: accountId,
				},
			})

			if (!character) {
				return false
			}

			await this.database.prisma.character.delete({
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

	public async updateCharacter(character: Character) {
		try {
			const jobs: Job[] = []

			character?.jobs.forEach((job) => {
				jobs.push(job)
			})

			await this.database.prisma.character.update({
				where: {
					id: character.id,
				},
				data: {
					guildId: character.guildId,
					cosmeticId: character.cosmeticId,
					sex: character.sex,
					experience: character.experience,
					look: ContextEntityLook.convertToString(character.look),
					mapId: character.mapId.toString(),
					cellId: character.cellId.toString(),
					direction: character.direction,
					kamas: character.kamas,
					statsPoints: character.statsPoints,
					stats: JSON.stringify(character?.stats?.saveAsJSON()),
					jobs: JSON.stringify(jobs.map((job) => job.saveAsJSON())),
					shortcuts: character.saveShortcutsAsJSON(),
					spells: character.saveSpellsAsJSON(),
					finishMoves: character.saveFinishmovesAsJSON(),
					knownZaaps: character.saveKnownZaapsAsJSON(),
					spawnMapId: character.spawnMapId,
					spawnCellId: character.spawnCellId,
          finishedAchievements: character.finishedAchievements,
          almostFinishedAchievements: character.almostFinishedAchievements,
          finishedAchievementObjectives: character.finishedAchievementObjectives,
          untakenAchievementsReward: character.untakenAchievementsReward
				},
			})
		} catch (error) {
			console.log(error)
		}
	}

	private serializeColors(colors: number[]): string {
		return colors.join(",")
	}
}

export default CharacterController
