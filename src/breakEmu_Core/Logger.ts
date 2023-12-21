import * as PinoLogger from "pino"
import { ansiColorCodes } from "./Colors"

class Logger {
	private _logger: PinoLogger.Logger

	constructor(msgPrefix: string = "breakEmu",) {
		this._logger = PinoLogger.default({
      timestamp: false,
      base: undefined,
			msgPrefix: `[${msgPrefix}]: `,
			transport: {
				target: "pino-pretty",
			},

		})
	}

	public newLine(): void {
		this._logger.info("")
	}

	private Colorize(msg: string, color: string): string {
		return `${color}${msg}\x1b[0m`
	}

	public error(msg: string): void {
		this._logger.error(msg)
	}

	public warn(msg: string): void {
		this._logger.warn(msg)
	}

	public write(message: string, color?: string): void {
		if (color) {
			this._logger.info(this.Colorize(message, color))
		} else {
			this._logger.info(message)
		}
	}

  private supressLoggerLevel(msg: string): string {
    return `\r\x1b[K${msg}`;
  }

  public async writeAsync(message: string, color?: string): Promise<void> {
    return new Promise(resolve => {
        this.write(message, color); // Assuming this.write is your existing synchronous method
        setTimeout(resolve, 10); // Adjust the delay as needed
    });
  }

	public async logo(): Promise<void> {
    this.newLine()
    await this.writeAsync(" ▄▄▄▄    ██▀███  ▓█████ ▄▄▄       ██ ▄█▀", ansiColorCodes.bright)
    await this.writeAsync("▓█████▄ ▓██ ▒ ██▒▓█   ▀▒████▄     ██▄█▒ ", ansiColorCodes.bright)
    await this.writeAsync("▒██▒ ▄██▓██ ░▄█ ▒▒███  ▒██  ▀█▄  ▓███▄░ ", ansiColorCodes.bright)
    await this.writeAsync("▒██░█▀  ▒██▀▀█▄  ▒▓█  ▄░██▄▄▄▄██ ▓██ █▄ ", ansiColorCodes.bright)
    await this.writeAsync("░▓█  ▀█▓░██▓ ▒██▒░▒████▒▓█   ▓██▒▒██▒ █▄", ansiColorCodes.bright)
    await this.writeAsync("░▒▓███▀▒░ ▒▓ ░▒▓░░░ ▒░ ░▒▒   ▓▒█░▒ ▒▒ ▓▒", ansiColorCodes.bright)
    await this.writeAsync("▒░▒   ░   ░▒ ░ ▒░ ░ ░  ░ ▒   ▒▒ ░░ ░▒ ▒░", ansiColorCodes.bright)
    await this.writeAsync(" ░    ░   ░░   ░    ░    ░   ▒   ░ ░░ ░ ", ansiColorCodes.bright)
    await this.writeAsync(" ░         ░        ░  ░     ░  ░░  ░   ", ansiColorCodes.bright)
    await this.writeAsync("      ░                                 ", ansiColorCodes.bright)
  }

	public async onStartup(): Promise<void> {
		await this.writeAsync("Starting breakEmu...", ansiColorCodes.green)

		await this.logo()
    this.newLine()

    this.write("Written by Sterben with 🥐🍷", ansiColorCodes.blue)
    this.newLine();
	}
}

export default Logger
