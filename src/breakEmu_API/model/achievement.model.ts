import {
	AchievementAchieved,
	AchievementAchievedRewardable,
	Achievement as AchievementMessage,
} from "@breakEmu_Protocol/IO"
import AchievementObjective from "./achievementObjective.model"
import AchievementReward from "./achievementReward.model"
import Character from "./character.model"

class Achievement {
	id: number
  name: string
	categoryId: number
  description: string
	points: number
	level: number
	order: number
	accountLinked: boolean
	objectives: Map<number, AchievementObjective>
	rewards: Map<number, AchievementReward>

	constructor(
		id: number,
    name: string,
    description: string,
		categoryId: number,
		points: number,
		level: number,
		order: number,
		accountLinked: boolean,
		objectives: Map<number, AchievementObjective>,
		rewards: Map<number, AchievementReward>
	) {
		this.id = id
    this.name = name
    this.description = description
		this.categoryId = categoryId
		this.points = points
		this.level = level
		this.order = order
		this.accountLinked = accountLinked
		this.objectives = objectives
		this.rewards = rewards
	}

	public startedObjective(character: Character) {
		return Array.from(this.objectives.values()).filter(
			(objective) =>
				!character.finishedAchievementObjectives.includes(objective.id)
		)
	}

	public finishedObjective(character: Character) {
		return Array.from(this.objectives.values()).filter((objective) =>
			character.finishedAchievementObjectives.includes(objective.id)
		)
	}

	toAchievementMessage(character: Character) {
		return new AchievementMessage(
			this.id,
			this.finishedObjective(character).map((achi) =>
				achi.toAchievementObjective()
			),
			this.startedObjective(character).map((achi) =>
				achi.toAchievementStartedObjectiveMessage()
			)
		)
	}

	toAchievementAchieved(character: Character) {
		if (character.untakenAchievementsReward.includes(this.id)) {
			return new AchievementAchievedRewardable(
				this.id,
				character.id,
				character.level
			)
		} else {
			return new AchievementAchieved(this.id, character.id)
		}
	}

	achievementFinished(character: Character) {
		return character.finishedAchievements.includes(this.id)
	}

  achievementStarted(character: Character) {
    return character.almostFinishedAchievements.includes(this.id)
  }

	needToBeTaken(character: Character) {
		return (
			!this.achievementFinished(character) &&
			this.startedObjective(character).length == 0
		)
	}
}

export default Achievement
