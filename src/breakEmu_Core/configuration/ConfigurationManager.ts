import { existsSync, promises as fsPromises } from "fs"
import * as yaml from "js-yaml"
import * as YML from "yaml"
import { ansiColorCodes } from "../Colors"
import Logger from "../Logger"
import { IAuthConfiguration } from "../types/fileType"
import DofusConfiguration from "./DofusConfiguration"

class ConfigurationManager extends DofusConfiguration {
	public logger: Logger = new Logger("ConfigurationManager")

	public CONFIG_NAME: string = "config.yml"
	public static instance: ConfigurationManager

	private totalParameters: number = 0
	private loadedParameters: number = 0
	private configResult: IAuthConfiguration | null = null

	constructor() {
		super()
	}

	public static getInstance(): ConfigurationManager {
		if (!ConfigurationManager.instance) {
			ConfigurationManager.instance = new ConfigurationManager()
		}

		return ConfigurationManager.instance
	}

	public async Load(): Promise<void> {
		try {
			const fileExists = existsSync(this.CONFIG_NAME)

			if (fileExists) {
				const fileContents = await fsPromises.readFile(this.CONFIG_NAME, "utf8")
				this.configResult = yaml.load(fileContents) as IAuthConfiguration

				await this.logger.writeAsync(
					"Loading configuration file...",
					ansiColorCodes.green
				)

				for (const category in this.configResult) {
					const categoryConfig = this.configResult[
						category as keyof IAuthConfiguration
					]
					await this.processCategory(category, categoryConfig)
				}

				await this.logger.writeAsync(
					"Configuration loaded successfully. \n",
					ansiColorCodes.green
				)
			} else {
				await this.logger.writeAsync(
					"No configuration file found, creating one...",
					ansiColorCodes.magenta
				)
				this.Default()
				await this.Save()
			}
		} catch (error) {
			// Handle any errors that might occur
			console.error(error)
			// Optionally, rethrow the error or handle it as needed
		}
	}

	// Fonction pour calculer le nombre total de paramètres
	private calculateTotalParameters(config: IAuthConfiguration): number {
		let count = 0
		for (const categorie in config) {
			// @ts-ignore
			const ctg = config[categorie]
			for (const _ in ctg) {
				count++
			}
		}
		return count
	}

	// Function to update and display progress
	private async updateProgress(configResult: IAuthConfiguration) {
		this.loadedParameters++
		this.totalParameters = this.calculateTotalParameters(configResult) // Recalculer le total
		const progressPercent = (this.loadedParameters / this.totalParameters) * 100
		await this.logger.writeAsync(
			`Loading progress: ${progressPercent.toFixed(2)}%`
		)
		await new Promise((resolve) => setTimeout(resolve, 10))
	}

	private async processCategory(
		category: string,
		categoryConfig: any
	): Promise<void> {
		const isSpecialCategory = this.isCategory(category)
		for (const key in categoryConfig) {
			this.totalParameters++
			const value = categoryConfig[key]
			const propertyName = isSpecialCategory
				? `${category}${this.capitalizeFirstLetter(key)}`
				: key

			if (propertyName in this) {
				// Check if the property exists in ConfigurationManager
				// @ts-ignore
				this[propertyName as keyof ConfigurationManager] = value
				await this.updateProgress(this.configResult as IAuthConfiguration) // Update progress after each assignment
			} else {
				console.warn(`Unrecognized property: ${propertyName}`)
			}
		}
	}

	private isCategory(category: string): boolean {
		return new Set(["database", "authServer", "worldServer"]).has(category)
	}

	private capitalizeFirstLetter(string: string): string {
		return string.charAt(0).toUpperCase() + string.slice(1)
	}

	public async Save(): Promise<void> {
		const data: IAuthConfiguration = {
			database: {
				host: this.databaseHost,
				port: this.databasePort,
				user: this.databaseUser,
				password: this.databasePassword,
				name: this.databaseName,
			},
			authServer: {
				host: this.authServerHost,
				port: this.authServerPort,
			},
			worldServer: {
				host: this.worldServerHost,
				port: this.worldServerPort,
			},
			dofus: {
				dofusProtocolVersion: this.dofusProtocolVersion,
				versionMajor: this.versionMajor,
				versionMinor: this.versionMinor,
				apLimit: this.apLimit,
				startAp: this.startAp,
				startMp: this.startMp,
				mpLimit: this.mpLimit,
				startMapId: this.startMapId,
				startCellId: this.startCellId,
				startLevel: this.startLevel,
				startKamas: this.startKamas,
				startStatsPoints: this.startStatsPoints,
				XpRate: this.XpRate,
        jobXpRate: this.jobXpRate,
        dropRate: this.dropRate
			},
			debug: {
				showDebugMessages: this.showDebugMessages,
				showProtocolMessage: this.showProtocolMessage,
				showDatabaseLogs: this.showDatabaseLogs,
			},
		}

		const yamlStr = YML.stringify(data)

		await fsPromises.writeFile(this.CONFIG_NAME, yamlStr, "utf8")

		await this.logger.writeAsync(
			`Configuration saved successfully: ${__dirname}/${this.CONFIG_NAME}`,
			ansiColorCodes.green
		)
	}

	public Default(): void {
		this.databaseHost = "127.0.0.1"
		this.databasePort = 3306
		this.databaseName = "breakEmu"
		this.databaseUser = "root"
		this.databasePassword = ""

		this.authServerHost = "127.0.0.1"
		this.authServerPort = 443

		this.worldServerHost = "127.0.0.1"
		this.worldServerPort = 5555

		this.dofusProtocolVersion = "1.0.3+7dfcc24"
		this.versionMajor = 2
		this.versionMinor = 69
		this.apLimit = 12
		this.startAp = 6
		this.startMp = 3
		this.mpLimit = 6
		this.startLevel = 1
		this.startMapId = 7411
		this.startCellId = 311
		this.startKamas = 0
		this.startStatsPoints = 0
		this.XpRate = 1

		this.showDebugMessages = false
		this.showProtocolMessage = false
		this.showDatabaseLogs = false
	}
}

export default ConfigurationManager
