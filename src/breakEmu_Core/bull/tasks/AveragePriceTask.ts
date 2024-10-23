import Bull from "bull"
import WorldServer from "@breakEmu_World/WorldServer"
import Task from "../Task" // Assurez-vous que le chemin d'importation est correct
import ContextHandler from "@breakEmu_World/handlers/ContextHandler"

class AveragePriceTask extends Task {
	// Suppression de la déclaration de queue ici, car elle sera héritée
	queue: Bull.Queue

	constructor() {
		super()
		this.queue = new Bull("AveragePriceTask", {
			redis: process.env.REDIS_URI as string,
		})

		this.queue.process(async (job, done) => {
			// Logique de la tâche de sauvegarde
			console.log("Requête de prix moyen envoyée à tous les joueurs.")
			await this.container.get(WorldServer).sendAveragePricesToAllPlayers()
			done()
		})

		this.queue.on("completed", (job) => {
			job.remove()
		})
	}

	public run(): Task {
		this.queue.add({}, { repeat: { cron: this.cronTime } })
		return this
	}

	restart(): Task {
		// Implémentez la logique de redémarrage ici
		console.log("Tâche redémarrée.")
		return this
	}

	stop(): void {
		// Implémentez la logique d'arrêt ici
		console.log("Tâche arrêtée.")
		this.queue.empty() // Ceci est un exemple pour vider la file d'attente
	}
}

export default AveragePriceTask
