import Bull from "bull"
import InteractiveElementModel from "@breakEmu_API/model/InteractiveElement.model"
import Task from "../Task"

class InteractiveElementBonus extends Task {
	queue: Bull.Queue = new Bull("InteractiveElementBonusQueue", {
		redis: process.env.REDIS_URI as string,
	})
	static AGE_BONUS_MAX: number = 200

	element: InteractiveElementModel

	constructor(element: InteractiveElementModel) {
		super()
		this.element = element
	}

	// Méthode pour exécuter la tâche
	public run(): Task {
		const jobId = `element-${this.element.id}-${this.element.mapId}`
		this.queue.add(
			{ elementId: this.element.id, mapId: this.element.mapId },
			{ jobId, repeat: { cron: this.cronTime }, removeOnComplete: true }
		)

		return this
	}

	public initialize() {
		this.queue.process(async (job, done) => {
			const elementId = job.data.elementId
			const mapId = job.data.mapId
			const element = InteractiveElementModel.getInteractiveCellByElementIdAndMapId(
				elementId,
				mapId
			)
			if (element) {
				console.log(
					`Exécution de la tâche pour l'élément ${elementId}-${element.mapId}...`
				)
				if (element.ageBonus < InteractiveElementBonus.AGE_BONUS_MAX) {
					InteractiveElementBonus.updateAgeBonus(element)
				}
			}
			done()
		})
	}

	// Méthode statique pour réinitialiser le timer d'un élément spécifique
	public resetElementTimer(elementId: number, mapId: number) {
		const jobId = `element-${elementId}-${mapId}`
		this.queue
			.removeRepeatableByKey(jobId)
			.then(() => {
				this.queue.add(
					{ elementId: elementId, mapId: mapId },
					{
						jobId,
						repeat: { cron: this.cronTime },
						removeOnComplete: true,
					}
				)
			})
			.catch((error) => console.error(error))
	}

	static updateAgeBonus(element: InteractiveElementModel) {
		if (element.ageBonus < InteractiveElementBonus.AGE_BONUS_MAX) {
			element.ageBonus += 10

			element.bonusTask?.onComplete(element)
		}
	}

	public onComplete(element: InteractiveElementModel): void {
		this.addHour(3, true)
		this.resetElementTimer(element?.elementId, element?.mapId)
	}

	restart(): Task {
		throw new Error("Method not implemented.")
	}
	stop(): void {
		throw new Error("Method not implemented.")
	}
}

export default InteractiveElementBonus
