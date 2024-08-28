import Bull from "bull"
import InteractiveElementModel from "@breakEmu_API/model/InteractiveElement.model"
import Task from "../Task"

class BonusTask extends Task {
	static queue: Bull.Queue // Déclaration statique pour réutiliser la même queue
	static AGE_BONUS_MAX: number = 200

	element: InteractiveElementModel

	constructor(element: InteractiveElementModel) {
		super()
		this.element = element
		// Utiliser la méthode statique pour obtenir l'instance de la queue
		BonusTask.queue = BonusTask.getQueue()
	}

	// Méthode statique pour initialiser ou récupérer la queue
	static getQueue(): Bull.Queue {
		if (!this.queue) {
			this.queue = new Bull("BonusQueue", {
				redis: process.env.REDIS_URI as string,
				defaultJobOptions: {
					removeOnComplete: true,
					removeOnFail: true,
				},
			})
		}
		return this.queue
	}

	// Méthode pour exécuter la tâche
	public run(): Task {
		const jobId = `BonusQueue-${this.element.id}-${this.element.mapId}`
		BonusTask.getQueue().add(
			{ elementId: this.element.id, mapId: this.element.mapId },
			{ jobId, repeat: { cron: this.cronTime } }
		)
		return this
	}

	public static init(): void {
		this.queue.process(async (job, done) => {
			const elementId = job.data.elementId
			const element = InteractiveElementModel.getById(elementId)
			if (element) {
				if (element.harvestable && element.ageBonus < BonusTask.AGE_BONUS_MAX) {
					BonusTask.updateAgeBonus(element)
				}
			}
			done()
		})

		this.queue.on("completed", (job) => {
			job.remove()
		})
	}

	static updateAgeBonus(element: InteractiveElementModel) {
		if (element.ageBonus < BonusTask.AGE_BONUS_MAX) {
			element.ageBonus += 10
		}
	}

	restart(): Task {
		throw new Error("Method not implemented.")
	}
	stop(): void {
		throw new Error("Method not implemented.")
	}
}

export default BonusTask
