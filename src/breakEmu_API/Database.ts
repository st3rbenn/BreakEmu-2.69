import { PrismaClient } from "@prisma/client"
import Logger from "../breakEmu_Core/Logger"
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
		this.prisma = new PrismaClient()
	}

	public async initialize(): Promise<void> {
		try {
			await this.prisma.$connect()
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
