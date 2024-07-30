import AchievementManager from "../../breakEmu_World/manager/achievement/AchievementManager"
import Experience from "../../breakEmu_API/model/experience.model"
import {
  JobCrafterDirectorySettings,
  JobDescription,
  JobExperience,
  JobExperienceUpdateMessage,
  JobLevelUpMessage,
  JobTypeEnum
} from "../../breakEmu_Server/IO"
import SkillManager from "../../breakEmu_World/manager/skills/SkillManager"
import Character from "./character.model"

interface JobJSON {
	jobId: number
	experience: number
}

class Job {
	jobId: number
	experience: number
	level: number

	static MAX_LEVEL = 200
	static WEIGHT_BONUS_PER_LEVEL = 12
	static WEIGHT_BONUS_DECREASE = 1 / 200

	constructor(jobId: number, experience: number) {
		this.jobId = jobId
		this.experience = experience
	}

	public async setExperience(experience: number, character: Character) {
		this.experience += experience
		const nextLevelFloor = Experience.getJobLevelNextFloor(this.level)

		await character.client?.Send(
			new JobExperienceUpdateMessage(this.getJobExperience())
		)

		if (this.experience >= nextLevelFloor && this.level < Job.MAX_LEVEL) {
			this.level = Experience.getJobLevel(this.experience)
			await this.onLevelUp(character, this.level - 1, this.level)
      await AchievementManager.getInstance().checkJobLevelAchievements(character, this)
		}
	}

	public async onLevelUp(
		character: Character,
		lastLevel: number,
		newLevel: number
	) {
		await character.client?.Send(
			new JobExperienceUpdateMessage(this.getJobExperience())
		)
		await character.client?.Send(
			new JobLevelUpMessage(this.level, this.getJobDescription())
		)

		character.stats.currentMaxWeight =
			character.stats.currentMaxWeight +
			this.getWeightBonus(lastLevel, newLevel)
		await character.inventory.refreshWeight()

		character.skillsAllowed = SkillManager.getInstance().getAllowedSkills(
			character
		)
	}

	public async onLevelDown(
		character: Character,
		lastLevel: number,
		newLevel: number
	) {
		await character.client?.Send(
			new JobLevelUpMessage(this.level, this.getJobDescription())
		)

		character.stats.currentMaxWeight =
			character.stats.currentMaxWeight -
			this.getWeightBonus(lastLevel, newLevel)
		await character.inventory.refreshWeight()

		character.skillsAllowed = SkillManager.getInstance().getAllowedSkills(
			character
		)
	}

	public getWeightBonus(lastLevel: number, newLevel: number): number {
		let sum = 0

		for (let i = lastLevel; i < newLevel; i++) {
			sum += Math.max(
				1,
				Math.floor(Job.WEIGHT_BONUS_PER_LEVEL - i * Job.WEIGHT_BONUS_DECREASE)
			)
		}

		return sum
	}

	public getDirectorySettings(): JobCrafterDirectorySettings {
		return new JobCrafterDirectorySettings(this.jobId, this.level, true)
	}

	public getJobDescription(): JobDescription {
		return new JobDescription(this.jobId, [])
	}

	public getJobExperience(): JobExperience {
		const jobExp = {
			jobId: this.jobId,
			jobLevel: this.level > 0 ? this.level : 1,
			jobXP: Math.round(this.experience),
			jobXpLevelFloor: Experience.getJobLevelFloor(
				this.level > 0 ? this.level : 1
			),
			jobXpNextLevelFloor: Experience.getJobLevelNextFloor(
				this.level > 0 ? this.level : 1
			),
		}

		return new JobExperience(
			jobExp.jobId,
			jobExp.jobLevel,
			jobExp.jobXP,
			jobExp.jobXpLevelFloor,
			jobExp.jobXpNextLevelFloor
		)
	}

	public static new(): Map<number, Job> {
		const jobs: Map<number, Job> = new Map<number, Job>()

		for (const jobKey in JobTypeEnum) {
			// Vérifiez si jobKey est une clé numérique
			if (!isNaN(Number(jobKey))) {
				// Convertissez la clé en nombre et créez un nouvel objet Job
				const job = new Job(Number(jobKey), 0)
				jobs.set(job.jobId, job)
			}
		}

		return jobs
	}

	public saveAsJSON(): JobJSON {
		let jobJSON = {
			jobId: this.jobId,
			experience: this.experience,
		}

		return jobJSON
	}

	public static loadFromJson(jobsJSON: any): Map<number, Job> {
		const jobs: Map<number, Job> = new Map<number, Job>()
		jobsJSON.map((job: JobJSON) => {
			const j = new Job(job.jobId, job.experience)
			j.level = Experience.getJobLevel(j.experience)
			jobs.set(j.jobId, j)
		})

		return jobs
	}
}

export default Job
