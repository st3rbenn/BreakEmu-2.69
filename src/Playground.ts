import { genSaltSync, hashSync } from "bcrypt"
import Logger from "./breakEmu_Core/Logger"
import { Socket } from "net"
import ConnectionQueue from "./breakEmu_Auth/ConnectionQueue"
import Database from "./breakEmu_API/Database"
import * as fs from "fs"
import { ansiColorCodes } from "./breakEmu_Core/Colors"

interface BreedRoles {
	breedId: number
	roleId: number
	descriptionId: number
	value: number
	order: number
}

interface BreedFile {
	id: number
	maleLook: string
	femaleLook: string
	creatureBonesId: number
	maleArtwork: string
	femaleArtwork: string
	statsPointsForStrength: number[][]
	statsPointsForIntelligence: number[][]
	statsPointsForChance: number[][]
	statsPointsForAgility: number[][]
	statsPointsForVitality: number[][]
	statsPointsForWisdom: number[][]
	breedSpellsId: number[]
	breedRoles: BreedRoles[]
	maleColors: number[]
	femaleColors: number[]
	spawnMap: number
	complexity: number
	sortIndex: number
}

interface DungeonsFile {
	id: number
	name: string
	mapIds: number[]
	entranceMapId: number
	exitMapId: number
	optimalPlayerLevel: number
}

interface exp {
	level: number
	experiencePoints: number
}

interface Head {
  skins: string
  assetId: string
  breed: number
  gender: number
  label: string
  order: number
}

class Playground {
	public logger: Logger = new Logger("Playground")
	public database: Database = Database.getInstance()

	messageId: number = 0

	public async main(): Promise<void> {
		/**
		 * Generate Password ⬇
		 * const salt = genSaltSync(10)
		 * const hash = hashSync("admin", salt)
		 * this.logger.write(hash)
		 */

		/**
		 * Test the queueing system
		 * need to create a new socket for each connection
		 * need to be updated i guess
		 */
		// const arrayOfSocket: Socket[] = []

		// const socket = new Socket({
		// 	readable: true,
		// 	writable: true,
		// 	allowHalfOpen: false,
		// })

		// for (let i = 0; i < 10; i++) {
		// 	arrayOfSocket.push(socket)
		// }

		// await this.sendDataWithVariableDelay(arrayOfSocket, 50)

		/**
		 * hydrate database.
		 */

		await this.database.initialize()

		const jsonFile = this.readJsonFile("heads")
		const heads = JSON.parse(jsonFile) as Head[]

		for (const h of heads) {
			await this.logger.writeAsync(
				`Inserting head ${h.skins}`,
				ansiColorCodes.bgMagenta
			)

			await this.database.prisma.head.create({
				data: {
          skins: h.skins,
          assetId: h.assetId,
          breed: {
            connect: {
              id: h.breed
            }
          },
          gender: h.gender == 1,
          label: h.label,
          order: h.order
				},
			})
		}
	}

	async sendDataWithVariableDelay<D>(
		data: D[],
		startDelay: number
	): Promise<void> {
		for (let i = 0; i < data.length; i++) {
			await new Promise((resolve) => setTimeout(resolve, startDelay))
			await ConnectionQueue.getInstance().enqueue(data[i] as Socket)
		}
	}

	readJsonFile(fileName: string): string {
		return fs.readFileSync(`./src/breakEmu_API/data/${fileName}.json`, "utf-8")
	}

	parseStatsPoints(statsPoints: number[][]): string {
		return statsPoints.map((sp) => sp.join(",")).join("|")
	}
}

export default Playground

new Playground().main()
