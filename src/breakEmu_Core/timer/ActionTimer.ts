class ActionTimer {
	private action: () => Promise<void>
	private onFinish?: () => Promise<void> // Callback de fin ajouté
	private timer: NodeJS.Timeout | null = null
	private interval: number
	private loop: boolean
	public started: boolean = false

	constructor(
		interval: number,
		action: () => Promise<void>,
		loop: boolean,
		onFinish?: () => Promise<void>
	) {
		this.interval = interval // en millisecondes
		this.action = action
		this.loop = loop
		this.onFinish = onFinish // Enregistre le callback de fin
	}

	start(): void {
		if (this.action == null) {
			throw new Error("Unable to start timer. Action is null.")
		}
		this.stop() // Arrête le timer précédent si existant
		if (this.loop) {
			this.timer = setInterval(() => {
				this.action()
				// Pas d'appel de onFinish ici car le timer continue indéfiniment
			}, this.interval)
		} else {
			this.timer = setTimeout(() => {
				this.action()
				this.finish() // Appelle finish après l'exécution de l'action
			}, this.interval)
		}
		this.started = true
	}

	private finish(): void {
		if (this.onFinish) {
			this.onFinish()
		}
		this.dispose() // Nettoie le timer
	}

	pause(): void {
		this.stop()
		this.started = false
	}

	private stop(): void {
		if (this.timer != null) {
			if (this.loop) {
				clearInterval(this.timer)
			} else {
				clearTimeout(this.timer)
			}
			this.timer = null
		}
	}

	dispose(): void {
		this.stop()
		this.started = false
	}

	set Interval(newInterval: number) {
		this.interval = newInterval
		if (this.started) {
			this.start() // Redémarrer le timer avec le nouvel intervalle
		}
	}

	get Interval(): number {
		return this.interval
	}
}

export default ActionTimer
