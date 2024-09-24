import * as PinoLogger from "pino"
import ansiColorCodes from "./Colors"

class Logger {
	private logger: PinoLogger.Logger
	private totalParameters: number = 0
	private loadedParameters: number = 0

	private static instance: Logger

	public static getInstance(name: string): Logger {
		if (!this.instance) {
			this.instance = new Logger(name)
		}
		return this.instance
	}

	constructor(msgPrefix: string = "breakEmu") {
		this.logger = PinoLogger.default({
			timestamp: false,
			base: undefined,
			msgPrefix: `[${msgPrefix}]: `,
			transport: {
				target: "pino-pretty",
			},
		})
	}

	public newLine(): void {
		this.supressLoggerLevel("")
	}

	private Colorize(msg: string, color: string): string {
		return `${color ? color : ansiColorCodes.bright}${msg}\x1b[0m`
	}

	public error(msg: string, error: Error): void {
		this.logger.error(`${msg} \n [Stack]:  ${error.stack}`)
	}

	public warn(msg: string): void {
		this.write(msg, ansiColorCodes.yellow)
	}

	public write(message: string, color?: string): void {
		if (color) {
			this.logger.info(this.Colorize(message, color))
		} else {
			this.logger.info(message)
		}
	}

	public info(msg: string): void {
		this.logger.info(this.Colorize(msg, ansiColorCodes.orange))
	}

	private async supressLoggerLevel(msg: string, color?: string): Promise<void> {
		this.write(`\r\x1b[K${msg}`, color) // Assuming this.write is your existing synchronous method
	}

	public async writeAsync(message: string, color?: string): Promise<void> {
		if (color) {
			this.logger.info(this.Colorize(message, color))
		} else {
			this.logger.info(message)
		}
	}

	public async logo(): Promise<void> {
		this.newLine()
		try {
			await this.supressLoggerLevel(
				" ▄▄▄▄    ██▀███  ▓█████ ▄▄▄       ██ ▄█▀",
				ansiColorCodes.bright
			)
			await this.supressLoggerLevel(
				"▓█████▄ ▓██ ▒ ██▒▓█   ▀▒████▄     ██▄█▒ ",
				ansiColorCodes.bright
			)
			await this.supressLoggerLevel(
				"▒██▒ ▄██▓██ ░▄█ ▒▒███  ▒██  ▀█▄  ▓███▄░ ",
				ansiColorCodes.bright
			)
			await this.supressLoggerLevel(
				"▒██░█▀  ▒██▀▀█▄  ▒▓█  ▄░██▄▄▄▄██ ▓██ █▄ ",
				ansiColorCodes.bright
			)
			await this.supressLoggerLevel(
				"░▓█  ▀█▓░██▓ ▒██▒░▒████▒▓█   ▓██▒▒██▒ █▄         Written by Sterben with 🥐🍷",
				ansiColorCodes.bright
			)
			await this.supressLoggerLevel(
				"░▒▓███▀▒░ ▒▓ ░▒▓░░░ ▒░ ░▒▒   ▓▒█░▒ ▒▒ ▓▒",
				ansiColorCodes.bright
			)
			await this.supressLoggerLevel(
				"▒░▒   ░   ░▒ ░ ▒░ ░ ░  ░ ▒   ▒▒ ░░ ░▒ ▒░",
				ansiColorCodes.bright
			)
			await this.supressLoggerLevel(
				" ░    ░   ░░   ░    ░    ░   ▒   ░ ░░ ░ ",
				ansiColorCodes.bright
			)
			await this.supressLoggerLevel(
				" ░         ░        ░  ░     ░  ░░  ░   ",
				ansiColorCodes.bright
			)
			await this.supressLoggerLevel(
				"      ░                                 ",
				ansiColorCodes.bright
			)
		} catch (error) {
			this.write(`${error}`, ansiColorCodes.red)
		}
	}

	public async onStartup(): Promise<void> {
		await this.logo()
		this.newLine()
	}

	// async updateProgress(max: number, loaded: number) {
	// 	this.totalParameters = max
	// 	this.loadedParameters = loaded
	// 	const progressPercent = (this.loadedParameters / this.totalParameters) * 100
	// 	await this.writeAsync(`Loading progress: ${progressPercent.toFixed(2)}%`)
	// 	await new Promise((resolve) => setTimeout(resolve, 10))
	// }

	updateProgress(max: number, loaded: number) {
		this.totalParameters = max
		this.loadedParameters = loaded
		const progressPercent = (this.loadedParameters / this.totalParameters) * 100

		// Efface la ligne actuelle et positionne le curseur au début
		process.stdout.clearLine(0)
		process.stdout.cursorTo(0)

		process.stdout.write(`Loading progress: ${progressPercent.toFixed(2)}%`)

		// Si tu souhaites passer à la ligne une fois le chargement terminé
		if (loaded >= max) {
			process.stdout.write("\n")
		}
	}
}

export default Logger
