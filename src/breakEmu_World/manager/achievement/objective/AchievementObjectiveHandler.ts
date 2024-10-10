import Achievement from "@breakEmu_API/model/achievement.model"
import AchievementObjective from "@breakEmu_API/model/achievementObjective.model"
import Character from "@breakEmu_API/model/character.model"
import ObjectiveCriterion from "./objectiveCriterion/ObjectiveCriterion"
import AchievementCriterionManager from "./objectiveCriterion/AchievementCriterionManager"
import AchievementManager from "../AchievementManager"
import Container from "@breakEmu_Core/container/Container"

class AchievementObjectiveHandler {
  private container: Container = Container.getInstance()
	character: Character
	achievementObjective: AchievementObjective
	achievement: Achievement

	criterion: ObjectiveCriterion[]

	constructor(
		character: Character,
		achievementObjective: AchievementObjective,
		achievement: Achievement
	) {
		this.character = character
		this.achievementObjective = achievementObjective
		this.achievement = achievement
	}

	initializeCriterion() {
		const manager = new AchievementCriterionManager(this)
		this.criterion = manager.generateCriterion()
	}

	async tryCompleteObjective() {
		this.initializeCriterion()
		if (
			this.character.finishedAchievements.includes(this.achievement?.id) ||
			!this.isValidObjective()
		)
			return
		this.achievementObjective.completeObjective(this.character)
		await this.container.get(AchievementManager).checkAchievementCompletion(
			this.character,
			this.achievement
		)
	}

	isValidObjective() {
		return (
			this.criterion &&
			this.criterion.length > 0 &&
			this.criterion.every((c) => c.criterionFulfilled())
		)
	}
}

export default AchievementObjectiveHandler
