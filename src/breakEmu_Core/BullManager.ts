import Bull from "bull"
import WorldServer from "../breakEmu_World/WorldServer"
import Logger from "./Logger"

class BullManager {
	private static _instance: BullManager
	private static logger: Logger = new Logger("BullManager")
	private saveQueue: Bull.Queue

	private constructor() {
		this.saveQueue = new Bull("saveQueue", {
			redis: process.env.REDIS_URI as string,
		})

		// Définir le traitement de la file d'attente
		this.saveQueue.process(async (job, done) => {
			// Logique de la tâche de sauvegarde
			BullManager.logger.write("Exécution de la tâche de sauvegarde...")
			WorldServer.getInstance().save()
      done()
		})

    this.saveQueue.on('completed', (job) => {
      job.remove();
  });
	}

	public static getInstance(): BullManager {
		if (!BullManager._instance) {
			BullManager._instance = new BullManager()
		}
		return BullManager._instance
	}

	public async Start(): Promise<void> {
		BullManager.logger.write(`Starting BullManager`)

		// Planifier la tâche récurrente
		this.saveQueue.add({}, { repeat: { cron: "*/30 * * * * *" } }) // Toutes les 15 secondes
	}

	// Ajoutez ici d'autres méthodes si nécessaire
}

export default BullManager
