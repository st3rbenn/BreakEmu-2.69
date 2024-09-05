import Bull from 'bull';
import WorldServer from '@breakEmu_World/WorldServer';
import Task from '../Task'; // Assurez-vous que le chemin d'importation est correct

class SaveTask extends Task {
	// Suppression de la déclaration de queue ici, car elle sera héritée
  queue: Bull.Queue;

	constructor() {
		super();
		this.queue = new Bull("SaveQueue", {
			redis: process.env.REDIS_URI as string,
		});

    this.queue.process(async (job, done) => {
			console.log("Exécution de la tâche de sauvegarde...", this.cronTime);
			this.container.get(WorldServer).save();
			done();
		});

		this.queue.on("completed", (job) => {
			job.remove();
		});
	}

	public run(): Task {
		this.queue.add({}, { repeat: { cron: this.cronTime } });
		return this;
	}

	restart(): Task {
		// Implémentez la logique de redémarrage ici
		console.log("Tâche redémarrée.");
		return this;
	}

	stop(): void {
		// Implémentez la logique d'arrêt ici
		console.log("Tâche arrêtée.");
		this.queue.empty(); // Ceci est un exemple pour vider la file d'attente
	}
}

export default SaveTask;