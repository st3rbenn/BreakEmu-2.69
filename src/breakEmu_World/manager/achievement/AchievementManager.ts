import AchievementHandler from "../../../breakEmu_World/handlers/achievement/AchievementHandler"
import Achievement from "../../../breakEmu_API/model/achievement.model"
import Character from "../../../breakEmu_API/model/character.model"

class AchievementManager {
	static achievements: Map<number, Achievement> = new Map<number, Achievement>()

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
      await AchievementHandler.handleSendAchievementFinishedMessage(character, achievement)
		} else if (!achievement.achievementFinished(character) && bypassCriterion) {
			character.untakenAchievementsReward.push(achievement.id)
			character.finishedAchievements.push(achievement.id)
      await AchievementHandler.handleSendAchievementFinishedMessage(character, achievement)
		}
	}
}

export default AchievementManager
