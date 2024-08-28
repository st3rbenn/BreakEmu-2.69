import Logger from "@breakEmu_Core/Logger"
import Skill from "@breakEmu_API/model/skill.model"
import AsyncRandom from "../AsyncRandom"
import Experience from "@breakEmu_API/model/experience.model"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"

class JobFormulas {
	private static logger: Logger = new Logger("JobFormulas")

	private static _instance: JobFormulas

  public static readonly MAX_JOB_LEVEL_GAP = 100

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

  public getCraftExperience(resultLevel: number, crafterLevel: number, craftXpRatio: number): number {
    let result = 0;
    let value = 0;

    if (resultLevel - JobFormulas.MAX_JOB_LEVEL_GAP > crafterLevel) {
        return 0;
    }

    value = 20.0 * resultLevel / (Math.pow(crafterLevel - resultLevel, 1.1) / 10.0 + 1.0);

    if (craftXpRatio > -1) {
        result = value * (craftXpRatio / 100);
    } else {
        result = value;
    }

    return Math.floor(result) * ConfigurationManager.getInstance().jobXpRate;
}
}

export default JobFormulas
