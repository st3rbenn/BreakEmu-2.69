import Achievement from "@breakEmu_API/model/achievement.model"
import AchievementObjective from "@breakEmu_API/model/achievementObjective.model"
import Character from "@breakEmu_API/model/character.model"
import Job from "@breakEmu_API/model/job.model"
import Logger from "@breakEmu_Core/Logger"
import AchievementHandler from "@breakEmu_World/handlers/achievement/AchievementHandler"
import AchievementObjectiveHandler from "./objective/AchievementObjectiveHandler"

class AchievementManager {
	logger: Logger = new Logger("AchievementManager")
	static achievements: Map<number, Achievement> = new Map<number, Achievement>()
	static achievementObjectives: Map<number, AchievementObjective> = new Map<
		number,
		AchievementObjective
	>()
	private static readonly LEVEL_ADJUSTMENT_FACTOR = 0.1
	private static readonly EXPERIENCE_MULTIPLIER = 1

	private levelAchievements: Map<number, Achievement> = new Map<
		number,
		Achievement
	>()

	private jobAchievements: Map<number, Achievement> = new Map<
		number,
		Achievement
	>()

	private levelJobAchievements: Map<number, Achievement> = new Map<
		number,
		Achievement
	>()

	static instance: AchievementManager

	constructor() {
		this.take(11).forEach((achievement) => {
			this.levelAchievements.set(achievement.id, achievement)
		})

		this.getAchievementsByCategoryId(7).forEach((achievement) => {
			this.jobAchievements.set(achievement.id, achievement)
		})

		this.take(3, this.jobAchievements).forEach((achievement) => {
			this.levelJobAchievements.set(achievement.id, achievement)
		})
	}

	private take(
		n: number,
		achievements: Map<number, Achievement> = AchievementManager.achievements
	) {
		return Array.from(achievements.values()).slice(0, n)
	}

	public async checkLevelAchievements(character: Character) {
		//this.checkPLAchievements(character)
		const levelToAdd = Array.from(this.levelAchievements.values()).filter(
			(achievement) =>
				!character.finishedAchievements.includes(achievement.id) &&
				achievement.level <= character.level
		)

		if (levelToAdd.length > 0) {
			for (const achievement of levelToAdd) {
				await this.checkAchievementCompletion(character, achievement, true)
			}
		}
	}

	public async checkJobLevelAchievements(character: Character, job: Job) {
		const jobLevelToAdd = Array.from(this.levelJobAchievements.values()).filter(
			(achievement) =>
				!character.finishedAchievements.includes(achievement.id) &&
				achievement.description.match(/\d+/g)?.[0] === job.level.toString()
		)

		if (jobLevelToAdd.length > 0) {
			for (const achievement of jobLevelToAdd) {
				await this.checkAchievementCompletion(character, achievement, true)
			}
		}
	}

	public async checkIsInMapAchievements(character: Character) {
		const explorationAchievement =
			character?.map?.subArea?.explorationAchievement
		if (explorationAchievement) {
			await this.checkAchievementCompletion(
				character,
				explorationAchievement,
				true
			)
			await this.checkAchievementObjectives(character, explorationAchievement)
		}
	}

	async checkAchievementObjectives(
		character: Character,
		achievement: Achievement
	) {
		let achievementObjectives = Array.from(
			AchievementManager.achievementObjectives.values()
		).filter(
			(achievementObj) =>
				achievementObj.criterion.includes("OA") &&
				achievementObj.criterion.includes(achievement.id.toString())
		)

		if (achievementObjectives.length <= 0) return

		for (const objective of achievementObjectives) {
			const achievementObjectifHandler = new AchievementObjectiveHandler(
				character,
				objective,
				this.getAchievementById(objective.achievementId) as Achievement
			)

			await achievementObjectifHandler.tryCompleteObjective()
		}
	}

	async checkAchievementCompletion(
		character: Character,
		achievement: Achievement,
		bypassCriterion: boolean = false
	) {
		if (achievement === undefined) return
		if (achievement.needToBeTaken(character)) {
			character.untakenAchievementsReward.push(achievement.id)
			character.finishedAchievements.push(achievement.id)
			character.almostFinishedAchievements = character.almostFinishedAchievements.filter(
				(id) => id != achievement.id
			)
			await AchievementHandler.handleSendAchievementFinishedMessage(
				character,
				achievement
			)
		} else if (!achievement.achievementFinished(character) && bypassCriterion) {
			character.untakenAchievementsReward.push(achievement.id)
			character.finishedAchievements.push(achievement.id)
			character.almostFinishedAchievements = character.almostFinishedAchievements.filter(
				(id) => id != achievement.id
			)
			await AchievementHandler.handleSendAchievementFinishedMessage(
				character,
				achievement
			)
		}
	}

	public getAchievementById(id: number) {
		return AchievementManager.achievements.get(id)
	}

	public getAchievementsByCategoryId(categoryId: number) {
		return Array.from(AchievementManager.achievements.values()).filter(
			(achievement) => achievement.categoryId == categoryId
		)
	}

	public async rewardAchievement(
		character: Character,
		achievement: Achievement
	) {
		if (!character.untakenAchievementsReward.includes(achievement.id)) {
			return
		}

		let experience: number = this.calculateWonExperience(character, achievement)
		let kamas: number = this.getKamasReward(achievement)

		if (experience < 0) {
			experience = 7200
		}

		this.logger.write(
			`Rewarding achievement ${achievement.id} to ${character.name} with ${experience} experience and ${kamas} kamas`
		)

		await character.addExperience(experience)

		if (kamas > 0) {
			await character.inventory.addKamas(kamas)
		}

		for (const reward of achievement.rewards.values()) {
			for (let i = 0; i < reward.itemsReward.length; i++) {
				let itemId = reward.itemsReward[i]
				let quantity = reward.ItemsQuantityReward[i]

				if (itemId > 0 && quantity > 0) {
					await character.inventory.addNewItem(itemId, quantity)
				}
			}

			for (const emote of reward.emotesReward) {
				await character.addEmote(emote)
			}

			for (const title of reward.titlesReward) {
				await character.addTitle(title)
			}

			for (const ornement of reward.ornamentsReward) {
				await character.addOrnament(ornement)
			}
		}

		character.untakenAchievementsReward = character.untakenAchievementsReward.filter(
			(id) => id != achievement.id
		)
		await character.refreshStats()
	}

	public calculateWonExperience(
		character: Character,
		achievement: Achievement
	): number {
		const level = achievement.level
		if (character.level > level) {
			const rewardLevel = Math.min(character.level, level * 0.7)
			const fixeOptimalLevelExperienceReward = this.getFixExperienceReward(
				Math.floor(level),
				1
			)
			const fixeLevelExperienceReward = this.getFixExperienceReward(
				Math.floor(rewardLevel),
				1
			)
			const reducedOptimalExperienceReward =
				(1 - 0.7) * fixeOptimalLevelExperienceReward
			const reducedExperienceReward = 0.7 * fixeLevelExperienceReward
			const sumExperienceRewards = Math.floor(
				reducedOptimalExperienceReward + reducedExperienceReward
			)
			return Math.floor(sumExperienceRewards * 2.25)
		} else {
			return Math.floor(this.getFixExperienceReward(character.level, 1))
		}
	}

	private getFixExperienceReward(level: number, duration: number): number {
		const levelPow = Math.pow(100 + 2 * level, 2)
		const result = ((level * levelPow) / 20) * duration * 1
		return result
	}

	public getKamasReward(achievement: Achievement): number {
		return Math.floor(
			Math.pow(achievement.level, 2) + 20 * achievement.level - 20
		)
	}
}

export default AchievementManager
