import { PrismaClient } from "@prisma/client"
import Logger from "../breakEmu_Core/Logger"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import BreedManager from "../breakEmu_World/manager/breed/BreedManager"
import ContextEntityLook from "../breakEmu_World/manager/entities/look/ContextEntityLook"
import Breed from "./model/breed.model"
import Character from "./model/character.model"
import Experience from "./model/experience.model"
import Head from "./model/head.model"
import World from "./model/world.model"
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
			this._logger.write("Database initialized")
		} catch (error) {
			await this._logger.writeAsync(
				`Error initializing database: ${error}`,
				"red"
			)
		}
	}

	public async loadAll(): Promise<void> {
		await this.prisma.$connect()

		/* Load all worlds */
		const worlds = await this.prisma.world.findMany()
		for (const w of worlds) {
			const world = new World(
				w.id,
				w.name,
				w.port,
				w.address,
				w.requireSubscription,
				w.completion,
				w.serverSelectable,
				w.charCapacity,
				w.charsCount,
				w.requiredRole,
				w.status,
				w.created_at,
				w.updated_at,
				w.deleted_at
			)
			World.worlds.push(world)
		}
    this._logger.writeAsync(`Loaded ${World.worlds.length} worlds`)

		/* Load all heads */
		const heads = await this.prisma.head.findMany()
		for (const h of heads) {
			const head = new Head(
				h.id,
				h.skins,
				h.assetId,
				h.breedId,
				h.gender,
				h.label,
				h.order
			)

			Head.heads.push(head)
		}
		this._logger.writeAsync(`Loaded ${Head.heads.length} heads`)

		/* Load all breeds */
		const breeds = await this.prisma.breed.findMany()
		for (const breed of breeds) {
			const breedRecord = new Breed(
				breed.id,
				breed.name,
				breed.maleLook,
				breed.femaleLook,
				breed.maleColors,
				breed.femaleColors,
				breed.spForIntelligence,
				breed.spForAgility,
				breed.spForStrength,
				breed.spForVitality,
				breed.spforWisdom,
				breed.spForChance,
				breed.startLifePoints
			)

			BreedManager.getInstance().breeds.push(breedRecord)
		}
		this._logger.writeAsync(`Loaded ${BreedManager.getInstance().breeds.length} breeds`)

		/* Load all experiences/Levels */
		const experiences = await this.prisma.experience.findMany()
		for (const experience of experiences) {
			Experience.experienceLevels.push(
				new Experience(Number(experience.level), Number(experience.experience))
			)
		}
		this._logger.writeAsync(
			`Loaded ${Experience.experienceLevels.length} levels`
		)
	}
}

export default Database
