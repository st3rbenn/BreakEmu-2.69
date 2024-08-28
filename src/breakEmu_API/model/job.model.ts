import Experience from "@breakEmu_API/model/experience.model"
import {
  JobCrafterDirectorySettings,
  JobDescription,
  JobExperience
} from "@breakEmu_Protocol/IO"

interface JobJSON {
	jobId: number
	experience: number
}

class Job {
	jobId: number
	experience: number
	level: number

	constructor(jobId: number, experience: number) {
		this.jobId = jobId
		this.experience = experience
	}

	public saveAsJSON(): JobJSON {
		let jobJSON = {
			jobId: this.jobId,
			experience: this.experience,
		}

		return jobJSON
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
