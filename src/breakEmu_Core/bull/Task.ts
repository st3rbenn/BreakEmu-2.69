import * as Bull from "bull" // Assurez-vous que Bull est correctement importé

abstract class Task {
	static queue: Bull.Queue // Assurez-vous que la queue est initialisée ailleurs
	public cronTime: string = "* * * * *" // Initialisez avec une valeur par défaut

	private seconds: number = 0
	private minutes: number = 0
	private hours: number = 0
	private days: number = 0

	abstract restart(): Task
	abstract stop(): void

	public abstract run(delay?: number): Task

  public setCron(cronTime: string): Task {
    this.cronTime = cronTime
    return this
  }

	// public addSecond(value: number, accumulate: boolean): Task {
	// 	if (accumulate) {
	// 		this.seconds += value
	// 	} else {
	// 		this.seconds = value
	// 	}
	// 	return this.buildCronTime() // Recalculez cronTime après modification
	// }

	// public addMinute(value: number, accumulate: boolean): Task {
	// 	if (accumulate) {
	// 		this.minutes += value
	// 	} else {
	// 		this.minutes = value
	// 	}
	// 	return this.buildCronTime() // Recalculez cronTime après modification
	// }

	// public addHour(value: number, accumulate: boolean): Task {
	// 	if (accumulate) {
	// 		this.hours += value
	// 	} else {
	// 		this.hours = value
	// 	}
	// 	return this.buildCronTime() // Recalculez cronTime après modification
	// }

	// public addDay(value: number, accumulate: boolean): Task {
	// 	if (accumulate) {
	// 		this.days += value
	// 	} else {
	// 		this.days = value
	// 	}
	// 	return this.buildCronTime() // Recalculez cronTime après modification
	// }

	// public buildCronTime(): Task {
	// 	this.cronTime = `${this.seconds > 0 ? `*/${this.seconds}` : "*"} ${
	// 		this.minutes > 0 ? `*/${this.minutes}` : "*"
	// 	} ${this.hours > 0 ? `*/${this.hours}` : "*"} ${
	// 		this.days > 0 ? `*/${this.days}` : "*"
	// 	} *`
	// 	return this
	// }
}

export default Task
