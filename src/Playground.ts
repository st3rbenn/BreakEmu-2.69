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

interface Breed {
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

interface skills {
	id: number
	name: string
	parentJobId: number
	gatheredRessourceItem: number
	interactiveId: number
	levelMin: number
}

interface spell {
	id: number
	name: string | number
	description: string | number
	spellLevels: number[],
  verboseCast: boolean
}

interface effects {
	targetMask: string
	diceNum: number
	visibleInBuffUi: boolean
	baseEffectId: number
	visibleInFightLog: boolean
	targetId: number
	effectElement: number
	effectUid: number
	dispellable: number
	triggers: string
	spellId: number
	duration: number
	random: number
	effectId: number
	delay: number
	diceSide: number
	visibleOnTerrain: boolean
	visibleInTooltip: boolean
	rawZone: string
	forClientOnly: boolean
	value: number
	order: number
	group: number
}

interface spellLevel {
	id: number
	spellId: number
	grade: number
	spellBreed: number
	apCost: number
	minRange: number
	range: number
	castInLine: boolean
	castInDiagonal: boolean
	castTestLos: boolean
	criticalHitProbability: number
	needFreeCell: boolean
	needTakenCell: boolean
	needVisibleEntity: boolean
	needCellWithoutPortal: boolean
	portalProjectionForbidden: boolean
	needFreeTrapCell: boolean
	rangeCanBeBoosted: boolean
	maxStack: number
	maxCastPerTurn: number
	maxCastPerTarget: number
	minCastInterval: number
	initialCooldown: number
	globalCooldown: number
	minPlayerLevel: number
	hideEffects: boolean
	hidden: boolean
	playAnimation: boolean
	statesCriterion: string
	effects: effects[]
	criticalEffect: effects[]
}

interface SpellVariant {
  id: number
  breedId: number
  spellIds: number[]
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

		const jsonFileName = "spells"
		const jsonFile = this.readJsonFile(jsonFileName)
		const data = JSON.parse(jsonFile) as spell[]

		for (const d of data) {
			await this.logger.writeAsync(
				`Update ${jsonFileName} -> ${d.name}`,
				ansiColorCodes.bgMagenta
			)

			await this.database.prisma.spell.update({
        data: {
          verbose: d.verboseCast
        },
        where: {
          id: d.id
        }
			})
		}

		console.log("Done")
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
