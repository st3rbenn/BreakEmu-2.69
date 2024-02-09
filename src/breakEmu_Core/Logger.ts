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
		this.supressLoggerLevel("")
	}

	private Colorize(msg: string, color: string): string {
		return `${color ? color : ansiColorCodes.bright}${msg}\x1b[0m`
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

  private async supressLoggerLevel(msg: string, color?: string): Promise<void> {
    await new Promise(resolve => {
      this.write(`\r\x1b[K${msg}`, color); // Assuming this.write is your existing synchronous method
      setTimeout(resolve, 10); // Adjust the delay as needed
  });
  }

  public async writeAsync(message: string, color?: string): Promise<void> {
    await new Promise(resolve => {
        this.write(message, color); // Assuming this.write is your existing synchronous method
        setTimeout(resolve, 10); // Adjust the delay as needed
    });
  }

	public async logo(): Promise<void> {
    this.newLine()
   try {
    await this.supressLoggerLevel(" ▄▄▄▄    ██▀███  ▓█████ ▄▄▄       ██ ▄█▀", ansiColorCodes.bright)
    await this.supressLoggerLevel("▓█████▄ ▓██ ▒ ██▒▓█   ▀▒████▄     ██▄█▒ ", ansiColorCodes.bright)
    await this.supressLoggerLevel("▒██▒ ▄██▓██ ░▄█ ▒▒███  ▒██  ▀█▄  ▓███▄░ ", ansiColorCodes.bright)
    await this.supressLoggerLevel("▒██░█▀  ▒██▀▀█▄  ▒▓█  ▄░██▄▄▄▄██ ▓██ █▄ ", ansiColorCodes.bright)
    await this.supressLoggerLevel("░▓█  ▀█▓░██▓ ▒██▒░▒████▒▓█   ▓██▒▒██▒ █▄         Written by Sterben with 🥐🍷", ansiColorCodes.bright)
    await this.supressLoggerLevel("░▒▓███▀▒░ ▒▓ ░▒▓░░░ ▒░ ░▒▒   ▓▒█░▒ ▒▒ ▓▒", ansiColorCodes.bright)
    await this.supressLoggerLevel("▒░▒   ░   ░▒ ░ ▒░ ░ ░  ░ ▒   ▒▒ ░░ ░▒ ▒░", ansiColorCodes.bright)
    await this.supressLoggerLevel(" ░    ░   ░░   ░    ░    ░   ▒   ░ ░░ ░ ", ansiColorCodes.bright)
    await this.supressLoggerLevel(" ░         ░        ░  ░     ░  ░░  ░   ", ansiColorCodes.bright)
    await this.supressLoggerLevel("      ░                                 ", ansiColorCodes.bright)
   } catch (error) {
     this.write(`${error}`, ansiColorCodes.red)
   }
  }

	public async onStartup(): Promise<void> {
		await this.logo()
    	this.newLine();
	}
}

export default Logger
