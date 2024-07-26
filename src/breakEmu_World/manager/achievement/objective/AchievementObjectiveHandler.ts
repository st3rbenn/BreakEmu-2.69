import Achievement from "../../../../breakEmu_API/model/achievement.model"
import AchievementObjective from "../../../../breakEmu_API/model/achievementObjective.model"
import Character from "../../../../breakEmu_API/model/character.model"
import ObjectiveCriterion from "./objectiveCriterion/ObjectiveCriterion"

class AchievementObjectiveHandler {
	id: number
	character: Character
	achievementObjective: AchievementObjective
  achievement: Achievement

  criterion: ObjectiveCriterion[]

  constructor(
    id: number,
    character: Character,
    achievementObjective: AchievementObjective,
    achievement: Achievement
  ) {
    this.id = id
    this.character = character
    this.achievementObjective = achievementObjective
    this.achievement = achievement
  }
}

export default AchievementObjectiveHandler
