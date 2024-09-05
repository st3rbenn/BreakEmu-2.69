import Character from "@breakEmu_API/model/character.model"
import Experience from "@breakEmu_API/model/experience.model"
import Job from "@breakEmu_API/model/job.model"
import {
	JobCrafterDirectorySettings,
	JobDescription,
	JobExperience,
	JobExperienceUpdateMessage,
	JobLevelUpMessage,
	JobTypeEnum,
} from "@breakEmu_Protocol/IO"
import AchievementManager from "../achievement/AchievementManager"
import SkillManager from "../skills/SkillManager"
import Container from "@breakEmu_Core/container/Container"

class JobManager {
  private container: Container = Container.getInstance()

	static MAX_LEVEL = 200
	static WEIGHT_BONUS_PER_LEVEL = 12
	static WEIGHT_BONUS_DECREASE = 1 / 200

	public async setExperience(
		experience: number,
		character: Character,
		job: Job
	) {
		job.experience += experience
		const nextLevelFloor = Experience.getJobLevelNextFloor(job.level)

		await character.client?.Send(
			new JobExperienceUpdateMessage(job.getJobExperience())
		)

		if (job.experience >= nextLevelFloor && job.level < JobManager.MAX_LEVEL) {
			job.level = Experience.getJobLevel(job.experience)
			await this.onLevelUp(character, job.level - 1, job.level, job)
			await this.container.get(AchievementManager).checkJobLevelAchievements(
				character,
				job
			)
		}
	}

	public async onLevelUp(
		character: Character,
		lastLevel: number,
		newLevel: number,
		job: Job
	) {
		await character.client?.Send(
			new JobExperienceUpdateMessage(job.getJobExperience())
		)
		await character.client?.Send(
			new JobLevelUpMessage(job.level, job.getJobDescription())
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
		newLevel: number,
		job: Job
	) {
		await character.client?.Send(
			new JobLevelUpMessage(job.level, job.getJobDescription())
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
				Math.floor(
					JobManager.WEIGHT_BONUS_PER_LEVEL -
						i * JobManager.WEIGHT_BONUS_DECREASE
				)
			)
		}

		return sum
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
}

export default JobManager
