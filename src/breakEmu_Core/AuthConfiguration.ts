import { ServerConfiguration } from "./ServerConfiguration"
import { promises as fsPromises, existsSync } from "fs"
import * as yaml from "js-yaml"
import * as YML from "yaml"
import Logger from "./Logger"
import { ansiColorCodes } from "./Colors"
import { IAuthConfiguration } from "./types/fileType"
import { createInterface } from "readline"

export class AuthConfiguration extends ServerConfiguration {
	public logger: Logger = new Logger("AuthConfiguration")

	public CONFIG_NAME: string = "auth.yml"
	public static instance: AuthConfiguration

	public dofusProtocolVersion: string = ""
	public versionMajor: number = 0
	public versionMinor: number = 0

	constructor() {
		super()
	}

	public static getInstance(): AuthConfiguration {
		if (!AuthConfiguration.instance) {
			AuthConfiguration.instance = new AuthConfiguration()
		}

		return AuthConfiguration.instance
	}

	public async Load(): Promise<void> {
		try {
			return await new Promise<void>(async (resolve, reject) => {
				const fileExists = existsSync(this.CONFIG_NAME)

				if (fileExists) {
					const fileContents = await fsPromises.readFile(
						this.CONFIG_NAME,
						"utf8"
					)
					const configResult = yaml.load(fileContents) as IAuthConfiguration

					// Total number of configuration parameters
					let totalParameters = 0 // À recalculer dynamiquement
					let loadedParameters = 0

					// Function to update and display progress
					const updateProgress = async () => {
						loadedParameters++
						totalParameters = calculateTotalParameters(configResult) // Recalculer le total
						const progressPercent = (loadedParameters / totalParameters) * 100
						await this.logger.writeAsync(
							`Loading progress: ${progressPercent.toFixed(2)}%`
						)
						await new Promise((resolve) => setTimeout(resolve, 10))
					}

					// Fonction pour calculer le nombre total de paramètres
					function calculateTotalParameters(
						config: IAuthConfiguration
					): number {
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

					await this.logger.writeAsync(
						"Loading configuration file...",
						ansiColorCodes.green
					) // Initial log

					for (const categorie in configResult) {
						const ctg = configResult[categorie as keyof IAuthConfiguration]
						for (const value in ctg) {
							totalParameters++
							const key2 = value as keyof typeof ctg
							const value2 = ctg[key2]

							// Construire le nom de la propriété avec le préfixe si nécessaire
							let propertyName =
								categorie === "database" || categorie === "authServer"
									? `${categorie}${capitalizeFirstLetter(key2)}`
									: key2

							if (propertyName in this) {
								// Vérifiez si la propriété existe dans AuthConfiguration
								this[propertyName as keyof AuthConfiguration] = value2
								await updateProgress() // Mise à jour de la progression après chaque affectation
							} else {
								console.warn(`Propriété non reconnue: ${propertyName}`)
                reject()
							}
						}
					}

					function capitalizeFirstLetter(string: string) {
						return string.charAt(0).toUpperCase() + string.slice(1)
					}

					await this.logger.writeAsync(
						"Configuration loaded successfully. \n",
						ansiColorCodes.green
					)

          resolve()
				} else {
					await this.logger.writeAsync(
						"No configuration file found, creating one...",
						ansiColorCodes.magenta
					)
					this.Default()
					await this.Save()
				}
			})
		} catch (e) {
			await this.logger.writeAsync(
				`Error loading configuration: ${e}`,
				ansiColorCodes.red
			)
		}
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
			debug: {
				showDebugMessages: this.showDebugMessages,
				showMessageProtocol: this.showMessageProtocol,
			},
			dofus: {
				dofusProtocolVersion: this.dofusProtocolVersion,
				versionMajor: this.versionMajor,
				versionMinor: this.versionMinor,
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

		this.dofusProtocolVersion = "1.0.3+7dfcc24"
		this.versionMajor = 2
		this.versionMinor = 69
	}
}
