import { PrismaClient } from "@prisma/client"
import Logger from "../breakEmu_Core/Logger"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
class Database {
	private static instance: Database
	public _logger: Logger = new Logger("Database")
	public prisma: PrismaClient

	public static getInstance(): Database {
		if (!Database.instance) {
			Database.instance = new Database()
		}

		return Database.instance
	}

	private constructor() {
		this.prisma = new PrismaClient({
			log: ConfigurationManager.getInstance().showDatabaseLogs
				? ["query", "info", "warn", "error"]
				: [],
		})

		//@ts-ignore
		this.prisma.$on("query", (e: any) => {
			this._logger.write("Query: " + e.query)
			this._logger.write("Params: " + e.params)
			this._logger.write("Duration: " + e.duration + "ms")
		})
	}

	public async initialize(): Promise<void> {
		try {
			await this.prisma.$connect()
			const queryTestConnection = "SELECT 1 + 1;"

			await this.prisma.$executeRawUnsafe(queryTestConnection)
			await this._logger.writeAsync("Database initialized")
		} catch (error) {
			await this._logger.writeAsync(
				`Error initializing database: ${error}`,
				"red"
			)
		}
	}
}

export default Database
