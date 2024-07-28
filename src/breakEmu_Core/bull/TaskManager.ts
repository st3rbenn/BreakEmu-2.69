import Logger from "../Logger"
import Task from "./Task"
import BonusTask from "./tasks/BonusTask"
import SaveTask from "./tasks/SaveTask"

class TaskManager {
	private static _instance: TaskManager
	private static logger: Logger = new Logger("TaskManager")

	private saveTask: SaveTask

	static getInstance(): TaskManager {
		if (!TaskManager._instance) {
			TaskManager._instance = new TaskManager()
		}

		return TaskManager._instance
	}

	saveTaskHandler(): Task {
		this.saveTask = new SaveTask()
		return this.saveTask
	}

	elementBonusHandler(): void {
		console.log("Initialisation de la tâche BonusTask...")
		BonusTask.init()
	}

	stopAllTasks(): void {
		console.log("Arrêt de toutes les tâches...")
		BonusTask.getQueue().close()

		if (this.saveTask) {
			this.saveTask.stop()
		}
	}
}

export default TaskManager
