import { Achievement as AchievementMessage } from "../../breakEmu_Server/IO"
import AchievementObjective from "./achievementObjective.model"
import AchievementReward from "./achievementReward.model"
import Character from "./character.model"

class Achievement {
	id: number
	categoryId: number
	points: number
	level: number
	order: number
	accountLinked: boolean
	objectives: Map<number, AchievementObjective>
	rewards: Map<number, AchievementReward>

	constructor(
		id: number,
		categoryId: number,
		points: number,
		level: number,
		order: number,
		accountLinked: boolean,
		objectives: Map<number, AchievementObjective>,
		rewards: Map<number, AchievementReward>
	) {
		this.id = id
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

	toAchivementMessage() {
		const achievementStartedObjectives = []

		for (const objective of this.objectives.values()) {
			achievementStartedObjectives.push(
				objective.toAchievementStartedObjectiveMessage()
			)
		}

		return new AchievementMessage(this.id, [], achievementStartedObjectives)
	}

	achievementFinished(character: Character) {
		return character.finishedAchievements.includes(this.id)
	}

	needToBeTaken(character: Character) {
		return (
			!this.achievementFinished(character) &&
			this.startedObjective(character).length == 0
		)
	}
}

export default Achievement
