import {
	AchievementStartedObjective,
	AchievementObjective as AchievementObjec,
} from "../../breakEmu_Server/IO"
import Character from "./character.model"

class AchievementObjective {
	id: number
	order: number
	criterion: string
  achievementId: number

	constructor(
		id: number,
		order: number,
		achievementId: number,
		criterion: string
	) {
		this.id = id
		this.order = order
		this.achievementId = achievementId
		this.criterion = criterion
	}

	toAchievementStartedObjectiveMessage() {
		return new AchievementStartedObjective(this.id, 1, 0)
	}

	toAchievementObjective() {
		return new AchievementObjec(this.id, 1)
	}


  completeObjective(character: Character) {
    if(!character.almostFinishedAchievements.includes(this.achievementId)) {
      character.almostFinishedAchievements.push(this.achievementId)
    }
    character.finishedAchievementObjectives.push(this.id)
  }
}

export default AchievementObjective
