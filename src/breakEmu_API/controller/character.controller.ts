import JobManager from "@breakEmu_World/manager/job/JobManager"
import Account from "@breakEmu_API/model/account.model"
import Experience from "@breakEmu_API/model/experience.model"
import Finishmoves from "@breakEmu_API/model/finishMoves.model"
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
import WorldClient from "@breakEmu_World/WorldClient"
import BaseController from "./base.controller"

class CharacterController {
	public logger: Logger = new Logger("CharacterController")
	public container: Container = Container.getInstance()
	public database: Database = this.container.get(Database)

	private NAME_REGEX: RegExp = /^[A-Z][a-z]{2,9}(?:-[A-Za-z][a-z]{2,9}|[a-z]{1,10})$/

	MaxCharacterSlots: number = 5

	public initialize(): void {
		throw new Error("Method not implemented.")
	}

	public async countCharacterByAccountId(accountId: number): Promise<number> {
		try {
			const count = await this.database.prisma.character.count({
				where: {
					userId: accountId,
				},
			})

			return count
		} catch (error) {
			await this.logger.writeAsync(
				`Error while counting characters for account ${accountId} \n ${
					(error as any).stack
				}`
			)
			return 0
		}
	}

	public async createCharacter(
		message: CharacterCreationRequestMessage,
		client: WorldClient
	): Promise<Character> {
		const characters = client.account.characters

		if (characters && characters.size >= this.MaxCharacterSlots) {
			await this.logger.writeAsync(
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
			await this.logger.writeAsync(
				`Error while creating character: character with same name already exists: ${message.name}`
			)
			throw new Error(CharacterCreationResultEnum.ERR_INVALID_NAME.toString())
		}

		if (!this.NAME_REGEX.test(message.name as string)) {
			await this.logger.writeAsync(
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
					userId: client.account.id as number,
					name: message.name as string,
					breed_id: message.breed as number,
					colors: this.serializeColors(message.colors as number[]),
					cosmeticId: message.cosmeticId as number,
					sex: message.sex as boolean,
					experience: startLevel.characterExp,
					look: ContextEntityLook.convertToString(look),
					cellId: this.container
						.get(ConfigurationManager)
						.startCellId.toString(),
					mapId: this.container.get(ConfigurationManager).startMapId.toString(),
					direction: 1,
					kamas: this.container.get(ConfigurationManager).startKamas,
					statsPoints: this.container.get(ConfigurationManager)
						.startStatsPoints,
					stats: JSON.stringify(stats),
					jobs: JSON.stringify(jobs),
					shortcuts: JSON.stringify([]),
					knownZaaps: JSON.stringify([]),
				},
			})

			const character = await Character.create(
				newCharacter.id,
				client.account.id,
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

			character.client = client
			return character
		} catch (error) {
			this.logger.write(`Error while creating character`)
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

			this.logger.info(`Character ${character.name} updated successfully`)
		} catch (error) {
			this.logger.write(
				`Error while updating character ${character.name}: ${
					(error as any).stack
				}`
			)
		}
	}

	private serializeColors(colors: number[]): string {
		return colors.join(",")
	}
}

export default CharacterController
