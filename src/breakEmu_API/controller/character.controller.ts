import JobManager from "@breakEmu_World/manager/job/JobManager"
import Account from "@breakEmu_API/model/account.model"
import Experience from "@breakEmu_API/model/experience.model"
import Finishmoves from "@breakEmu_API/model/finishmoves.model"
import Job from "@breakEmu_API/model/job.model"
import GameMap from "@breakEmu_API/model/map.model"
import Spell from "@breakEmu_API/model/spell.model"
import Logger from "@breakEmu_Core/Logger"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import { CharacterCreationRequestMessage } from "@breakEmu_Protocol/IO"
import CharacterCreationResultEnum from "@breakEmu_World/enum/CharacterCreationResultEnum"
import BreedManager from "@breakEmu_World/manager/breed/BreedManager"
import ContextEntityLook from "@breakEmu_World/manager/entities/look/ContextEntityLook"
import EntityStats from "@breakEmu_World/manager/entities/stats/entityStats"
import CharacterShortcut from "@breakEmu_World/manager/shortcut/character/CharacterShortcut"
import Database from "../Database"
import Character from "../model/character.model"
import Container from "@breakEmu_Core/container/Container"

class CharacterController {
	public _logger: Logger = new Logger("CharacterController")
  private container: Container = Container.getInstance()
	public database: Database = this.container.get(Database)

	private NAME_REGEX: RegExp = /^[A-Z][a-z]{2,9}(?:-[A-Za-z][a-z]{2,9}|[a-z]{1,10})$/

	MaxCharacterSlots: number = 5

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
		account: Account
	): Promise<Character> {
		const characters = account.characters

		if (characters && characters.size >= this.MaxCharacterSlots) {
			await this._logger.writeAsync(
				`Error while creating character: too many characters`
			)
			throw new Error(
				CharacterCreationResultEnum.ERR_TOO_MANY_CHARACTERS.toString()
			)
		}

		const characterWithSameName = await this.database.prisma.character.findFirst(
			{
				where: { name: message.name },
			}
		)

		if (characterWithSameName) {
			await this._logger.writeAsync(
				`Error while creating character: character with same name already exists: ${message.name}`
			)
			throw new Error(CharacterCreationResultEnum.ERR_INVALID_NAME.toString())
		}

		if (!this.NAME_REGEX.test(message.name as string)) {
			await this._logger.writeAsync(
				`Error while creating character: invalid name: ${message.name}`
			)
			throw new Error(CharacterCreationResultEnum.ERR_INVALID_NAME.toString())
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
			this.container.get(ConfigurationManager).startLevel
		) as Experience

		const jobs: Job[] = Array.from(JobManager.new().values())

		const stats = EntityStats.new(startLevel.level)
		stats.saveAsJSON()

		try {
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
					cellId: this.container.get(ConfigurationManager).startCellId.toString(),
					mapId: this.container.get(ConfigurationManager).startMapId.toString(),
					direction: 1,
					kamas: this.container.get(ConfigurationManager).startKamas,
					statsPoints: this.container.get(ConfigurationManager).startStatsPoints,
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
				this.container.get(ConfigurationManager).startMapId,
				this.container.get(ConfigurationManager).startCellId,
				newCharacter.direction,
				newCharacter.kamas,
				Finishmoves.getFinishmovesByFree(true),
				startLevel,
				stats
			)

			return character
		} catch (error) {
			this._logger.write(
				`Error while creating character: ${(error as any).stack}`
			)
			throw new Error(CharacterCreationResultEnum.ERR_NO_REASON.toString())
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
			this._logger.write(`Updating character ${character.name}`)
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
					finishedAchievementObjectives:
						character.finishedAchievementObjectives,
					untakenAchievementsReward: character.untakenAchievementsReward,
					knownEmotes: character.knownEmotes,
					knownTitles: character.knownTitles,
					knownOrnaments: character.knownOrnaments,
					activeOrnament: character.activeOrnament,
					activeTitle: character.activeTitle,
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
