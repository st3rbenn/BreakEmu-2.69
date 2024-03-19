import Logger from "../../../breakEmu_Core/Logger"
import Skill from "../../../breakEmu_API/model/skill.model"
import AsyncRandom from "../AsyncRandom"
import Experience from "../../../breakEmu_API/model/experience.model"

class JobFormulas {
	private static logger: Logger = new Logger("JobFormulas")

	private static _instance: JobFormulas

	public static getInstance(): JobFormulas {
		if (!JobFormulas._instance) {
			JobFormulas._instance = new JobFormulas()
		}

		return JobFormulas._instance
	}

	public getCollectedItemQuantity(jobLevel: number, skill: Skill): number {
		const random = new AsyncRandom()
		const min = jobLevel == Experience.maxJobLevel ? 7 : 1
		const max =
			skill.levelMin == Experience.maxJobLevel
				? 8
				: 7 + (jobLevel - skill.levelMin) / 10

		return random.next(min, max)
	}
}

export default JobFormulas
