import AchievementHandler from "../../../breakEmu_World/handlers/achievement/AchievementHandler"
import Achievement from "../../../breakEmu_API/model/achievement.model"
import Character from "../../../breakEmu_API/model/character.model"
import Item from "breakEmu_API/model/item.model"

class AchievementManager {
	static achievements: Map<number, Achievement> = new Map<number, Achievement>()
	private static readonly LEVEL_ADJUSTMENT_FACTOR = 0.7
	private static readonly EXPERIENCE_MULTIPLIER = 2.25

	private levelAchievements: Map<number, Achievement> = new Map<
		number,
		Achievement
	>()

	static instance: AchievementManager

	constructor() {
		this.take(11).forEach((achievement) => {
			this.levelAchievements.set(achievement.id, achievement)
		})
	}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new AchievementManager()
		}
		return this.instance
	}

	private take(n: number) {
		return Array.from(AchievementManager.achievements.values()).slice(0, n)
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

	async checkAchievementCompletion(
		character: Character,
		achievement: Achievement,
		bypassCriterion: boolean
	) {
		if (achievement === undefined) return
		if (achievement.needToBeTaken(character)) {
			character.untakenAchievementsReward.push(achievement.id)
			character.finishedAchievements.push(achievement.id)
			await AchievementHandler.handleSendAchievementFinishedMessage(
				character,
				achievement
			)
		} else if (!achievement.achievementFinished(character) && bypassCriterion) {
			character.untakenAchievementsReward.push(achievement.id)
			character.finishedAchievements.push(achievement.id)
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

	private calculateWonExperience(
		character: Character,
		achievement: Achievement
	): number {
		const achievementLevel = achievement.level
		if (character.level > achievementLevel) {
			const adjustedRewardLevel = Math.min(
				character.level,
				achievementLevel * AchievementManager.LEVEL_ADJUSTMENT_FACTOR
			)
			const optimalLevelExperience = this.getFixedExperienceReward(
				achievementLevel,
				1
			)
			const adjustedLevelExperience = this.getFixedExperienceReward(
				adjustedRewardLevel,
				1
			)

			// Calculate reduced rewards
			const reducedOptimalExperience =
				(1 - AchievementManager.LEVEL_ADJUSTMENT_FACTOR) *
				optimalLevelExperience
			const reducedAdjustedExperience =
				AchievementManager.LEVEL_ADJUSTMENT_FACTOR * adjustedLevelExperience

			const totalExperience = Math.floor(
				reducedOptimalExperience + reducedAdjustedExperience
			)
			return Math.floor(
				totalExperience * AchievementManager.EXPERIENCE_MULTIPLIER
			)
		} else {
			return Math.floor(
				this.getFixedExperienceReward(achievementLevel, 1) *
					AchievementManager.EXPERIENCE_MULTIPLIER
			)
		}
	}

	private getFixedExperienceReward(level: number, duration: number): number {
		const baseLevelFactor = 100 + 2 * level
		const levelPow = Math.pow(baseLevelFactor, 2)
		const result = ((level * levelPow) / 20) * duration
		return result
	}

	public getKamasReward(achievement: Achievement) {
		return Math.pow(achievement.level, 2) + 20 * achievement.level - 20
	}
}

export default AchievementManager
