import { AchievementStartedObjective } from "../../breakEmu_Server/IO"

class AchievementObjective {
	id: number
	order: number
	criterion: string

	constructor(id: number, order: number, criterion: string) {
		this.id = id
		this.order = order
		this.criterion = criterion
	}

	toAchievementStartedObjectiveMessage() {
		return new AchievementStartedObjective(this.id, 1, 0)
	}
}

export default AchievementObjective
