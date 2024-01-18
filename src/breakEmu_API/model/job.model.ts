import Experience from "../../breakEmu_API/model/experience.model"
import Skill from "./skill.model"
import {
	JobCrafterDirectorySettings,
	JobDescription,
	JobExperience,
	JobTypeEnum,
	SkillActionDescription,
} from "../../breakEmu_Server/IO"

interface JobJSON {
	[jobId: number]: {
		jobId: number
		experience: number
	}
}

class Job {
	private _jobId: number
	private _experience: number
	private _level: number

	constructor(jobId: number, experience: number) {
		this._jobId = jobId
		this._experience = experience
		this._level = Experience.getJobLevel(experience)
	}

	public get jobId(): number {
		return this._jobId
	}

	public get experience(): number {
		return this._experience
	}

	public get level(): number {
		return this._level
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
			jobLevel: this.level,
			jobXP: this.experience,
			jobXpLevelFloor: Experience.getJobLevelFloor(this.level),
			jobXpNextLevelFloor: Experience.getJobLevelFloor(this.level + 1),
		}

		return new JobExperience(
			jobExp.jobId,
			jobExp.jobLevel,
			jobExp.jobXP,
			jobExp.jobXpLevelFloor,
			jobExp.jobXpNextLevelFloor
		)
	}

	public static new(): Job[] {
		const jobs: Job[] = []

		for (const jobKey in JobTypeEnum) {
			// Vérifiez si jobKey est une clé numérique
			if (!isNaN(Number(jobKey))) {
				// Convertissez la clé en nombre et créez un nouvel objet Job
				jobs.push(new Job(Number(jobKey), 0))
			}
		}

		return jobs
	}

	public saveAsJSON(): JobJSON {
		const jobJSON: JobJSON = {}

		jobJSON[this.jobId] = {
			jobId: this.jobId,
			experience: this.experience,
		}

		return jobJSON
	}

	public static loadFromJson(jobsJSON: any): Job[] {
		const jobs: Job[] = []
		jobsJSON.forEach((job: any) => {
			jobs.push(
				new Job(
					(Object.values(job)[0] as any).jobId,
					(Object.values(job)[0] as any).experience
				)
			)
		})

		return jobs
	}
}

export default Job
