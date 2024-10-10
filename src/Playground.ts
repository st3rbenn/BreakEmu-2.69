import * as fs from "fs"
import Database from "./breakEmu_API/Database"
import ansiColorCodes from "./breakEmu_Core/Colors"
import Logger from "./breakEmu_Core/Logger"

import {
	BinaryBigEndianReader,
	BinaryBigEndianWriter,
	DofusMessage,
	DofusNetworkMessage,
	messages,
} from "./breakEmu_Protocol/IO"

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

interface Exp {
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

interface Skills {
	id: number
	name: string
	parentJobId: number
	gatheredRessourceItem: number
	interactiveId: number
	levelMin: number
}

interface Spell {
	id: number
	name: string | number
	description: string | number
	spellLevels: number[]
	verboseCast: boolean
}

interface Effects {
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

interface Item {
	Id: number
	Name: string
	typeId: number
	level: number
	realWeight: number
	cursed: boolean
	usable: boolean
	exchangeable: boolean
	price: number
	etheral: boolean
	itemSetId: number
	criteria: string
	AppearenceId: number
	dropMonsterIds: number[]
	recipeSlots: number
	recipeIds: number[]
	possibleEffects: Effects[]
	craftXpRatio: number
	isSaleable: boolean
	look: string
}

interface ItemSet {
	id: number
	items: number[]
	name: string
	bonusIsSecret: boolean
	effects: Effects[][]
}

interface weapon {
	id: number
	name: string
	typeId: number
	level: number
	realWeight: number
	cursed: boolean
	usable: boolean
	exchangeable: boolean
	price: number
	etheral: boolean
	itemSetId: number
	criteria: string
	appearanceId: number
	dropMonsterIds: number[]
	recipeSlots: number
	recipeIds: number[]
	possibleEffects: Effects[]
	craftXpRatio: number
	isSaleable: boolean
	apCost: number
	minRange: number
	range: number
	maxCastPerTurn: number
	castInLine: boolean
	castInDiagonal: boolean
	castTestLos: boolean
	criticalHitProbability: number
	criticalHitBonus: number
}

interface SpellLevel {
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
	effects: Effects[]
	criticalEffect: Effects[]
}

interface SpellVariant {
	id: number
	breedId: number
	spellIds: number[]
}

interface FinishMove {
	id: number
	duration: number
	free: boolean
	name: string
	category: number
	spellLevel: number
}

interface Cells {
	floor: number
	mov: boolean
	nonWalkableDuringFight: boolean
	nonWalkableDuringRP: boolean
	los: boolean
	blue: boolean
	red: boolean
	visible: boolean
	farmCell: boolean
	havenbagCell: boolean
	speed: number
	mapChangeData: number
	moveZone: number
}

interface Map {
	mapId: number
	subareaId: number
	topNeighbourId: number
	bottomNeighbourId: number
	leftNeighbourId: number
	rightNeighbourId: number
	mapVersion: number
	layers: Layer[]
	cellsCount: number
	cells: Cells[]
}

interface Layer {
	layerId: number
	cellsCount: number
	cells: LayerCell[]
}

interface LayerCell {
	cellId: number
	elementsCount: number
	elements: Element[]
}

interface Element {
	elementName: string
	elementId: number
	hue_1: number
	hue_2: number
	hue_3: number
	shadow_1: number
	shadow_2: number
	shadow_3: number
	offsetX: number
	offsetY: number
	altitude: number
	identifier: number
}

interface interactiveSkill {
	Id: string
	MapId: string
	Identifier: string
	ActionIdentifier: string
	Type: string
	SkillId: string
	Param1: string
	Param2: string
	Param3: string
	Criteria: string
}

interface SubArea {
	id: number
	nameId: string
	areaId: number
	level: number
	monsters: number[]
	quests: number[]
	npcs: number[]
	associatedZaapMapId: number
}

interface monsterSpawn {
	Id: string
	MonsterId: string
	SubareaId: string
	Probability: string
}

interface interactiveElement {
	UId: string
	ElementId: string
	MapId: string
	CellId: string
	ElementType: string
	GfxId: string
	GfxBonesId: string
}

interface mapScrollActions {
	id: number
	rightMapId: number
	leftMapId: number
	topMapId: number
	bottomMapId: number
}

interface QueryTest {
	identifier: number
	mapId: number
	elementId: number
	actionIdentifier: number
	cellId: number
	animated: number
	type: number
	skillId: number
	param1: string
	param2: string
	param3: string
	criteria: string
}

interface Achievement {
	id: number
	name: string
	categoryId: number
	description: string
	iconId: number
	points: number
	level: number
	order: number
	accountLinked: boolean
	objectiveIds: number[]
	rewardIds: number[]
}

interface AchievementObjectives {
	id: number
	achievementId: number
	order: number
	name: string
	criterion: string
}

interface AchievementReward {
	id: number
	achievementId: number
	criteria: string
	kamasRatio: number
	experienceRatio: number
	kamasScaleWithPlayerLevel: boolean
	itemsReward: number[]
	itemsQuantityReward: number[]
	emotesReward: number[]
	spellsReward: number[]
	titlesReward: number[]
	ornamentsReward: number[]
}

interface Recipe {
	id: number
	resultId: number
	resultName: string
	resultType: number
	resultLevel: number
	ingredients: number[]
	quantities: number[]
	jobId: number
	skillId: number
}

interface Npc {
	id: number
	name: string
	look: string
	gender: number
	actions: number[]
	dialogMessages: [number, number][]
	dialogReplies: [number, number][]
}

class Playground {
	public database: Database = new Database()
	public logger: Logger = new Logger("Playground")

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

		try {
			// const npcsJson: string = "testNpc"
			// const jsonFile = this.readJsonFile(npcsJson)
			// const npcs = JSON.parse(jsonFile) as Npc
			const allRecords = await this.database.prisma.interactiveSkill.findMany()

			const seen = new Set()
			const duplicates = allRecords.filter((record) => {
				// Concaténer toutes les colonnes pour chaque enregistrement
				const recordCopy = { ...record }
        recordCopy.id = 0
				const key = Object.values(recordCopy).join("|")

				// Vérifier si cette clé a déjà été vue
				if (seen.has(key)) {
					this.logger.write(`Duplicate found: ${key}`, ansiColorCodes.bgRed)
					return true // C'est un doublon
				}

				// Sinon, ajouter la clé au Set et continuer
				this.logger.write(`Not a duplicate: ${key}`, ansiColorCodes.bgGreen)
				seen.add(key)
				return false
			})

			const idsToDelete = duplicates.map((record) => record.id)

			await this.database.prisma.interactiveSkill.deleteMany({
				where: {
					id: {
						in: idsToDelete,
					},
				},
			})

			this.logger.write("finish ✨")
		} catch (error) {
			this.logger.write(error + "TRACE : " + error.stack, ansiColorCodes.bgRed)
		}
	}

	public deserialize(data: Buffer): DofusMessage | null {
		let messageId // Déclarer messageId en dehors du bloc try

		try {
			const reader = new BinaryBigEndianReader({
				maxBufferLength: data.length,
			}).writeBuffer(data)

			const header = DofusNetworkMessage.readHeader(reader)
			messageId = header.messageId // Affecter la valeur à messageId
			const instanceId = header.instanceId
			const payloadSize = header.payloadSize

			if (!(messageId in messages)) {
				this.logger.writeAsync(
					`Undefined message (id: ${messageId})`,
					ansiColorCodes.red
				)
			}

			const message = new messages[messageId]()
			message.deserialize(reader)

			return message
		} catch (error) {
			// Utiliser messageId ici
			this.logger.writeAsync(
				`Error while deserializing message with ID ${messageId}: ${error}`,
				ansiColorCodes.red
			)

			return null
		}
	}

	// async returnFirstValueOfAMap(map: Map<number, any>): any {
	// 	return map.values().next().value
	// }

	// async sendDataWithVariableDelay<D>(
	// 	data: D[],
	// 	startDelay: number
	// ): Promise<void> {
	// 	for (let i = 0; i < data.length; i++) {
	// 		await new Promise((resolve) => setTimeout(resolve, startDelay))
	// 		await ConnectionQueue.getInstance().enqueue(data[i] as Socket)
	// 	}
	// }

	readJsonFile(fileName: string): string {
		return fs.readFileSync(`./src/breakEmu_API/data/${fileName}.json`, "utf-8")
	}

	parseStatsPoints(statsPoints: number[][]): string {
		return statsPoints.map((sp) => sp.join(",")).join("|")
	}
}

new Playground().main()

// try {
// 	await this.database.loadInteractiveSkills()
// 	await this.database.loadInteractiveElements()
// 	const interactiveElementsFile =
// 		"src/breakEmu_API/data/interactiveelements.json"
// 	const folderPath = "src/breakEmu_API/data/output" // Chemin vers le dossier contenant les fichiers JSON
// 	const files = fs.readdirSync(folderPath)
// 	const ieFile = await fs.promises.readFile(interactiveElementsFile, "utf8")

// 	// Filtre pour ne traiter que les fichiers .json
// 	const jsonFiles = files.filter((file) => path.extname(file) === ".json")

// 	for (const fileName of jsonFiles) {
// 		const filePath = path.join(folderPath, fileName) // Construit le chemin complet du fichier
// 		const jsonFile = await fs.promises.readFile(filePath, "utf8") // Lit le contenu du fichier
// 		const data = JSON.parse(jsonFile) as Map // Parse le JSON

// 		// Ici, vous pouvez traiter chaque objet JSON comme vous le faisiez auparavant

// 		const gameMap = new GameMap(
// 			data.mapId,
// 			data.subareaId,
// 			data.mapVersion,
// 			data.leftNeighbourId,
// 			data.rightNeighbourId,
// 			data.topNeighbourId,
// 			data.bottomNeighbourId
// 		)

// 		//CELLS
// 		let cells = new Map<number, Cell>()

// 		for (let i = 1; i < data.cellsCount; i++) {
// 			let losMov = 0

// 			if (data.mapVersion >= 9) {
// 				losMov =
// 					(data.cells[i].mov ? 0 : 1) |
// 					(data.cells[i].nonWalkableDuringFight ? 2 : 0) |
// 					(data.cells[i].nonWalkableDuringRP ? 4 : 0) |
// 					(data.cells[i].los ? 0 : 8) |
// 					(data.cells[i].blue ? 16 : 0) |
// 					(data.cells[i].red ? 32 : 0) |
// 					(data.cells[i].visible ? 64 : 0) |
// 					(data.cells[i].farmCell ? 128 : 0)

// 				if (data.mapVersion >= 10) {
// 					losMov |= data.cells[i].havenbagCell ? 256 : 0
// 				}
// 			}

// 			const c = new Cell(
// 				i,
// 				data.cells[i].blue,
// 				data.cells[i].red,
// 				losMov,
// 				data.cells[i].mapChangeData
// 			)

// 			cells.set(i, c)
// 		}

// 		gameMap.cells = cells

// 		//ELEMENTS
// 		let elements = new Map<number, InteractiveElementModel>()
// 		const allInteractiveElements = Array.from(
// 			InteractiveElementModel.interactiveCells.values()
// 		)

// 		const foundedElement: InteractiveElementModel[] | undefined = []
// 		for (const layer of data.layers) {
// 			layer.cells.forEach((cell) => {
// 				for (let i = 0; i < cell.elementsCount; i++) {
// 					const element = cell.elements[i]

//           if(element.)

// 					allInteractiveElements
// 						.filter((ie) => ie.mapId === gameMap.id && ie.elementId === element.identifier)
// 						.forEach((ie) => {
//               foundedElement.push(ie)
// 						})

// 					// const test = InteractiveElementModel.getInteractiveCellByElementIdAndMapId(element.elementId, gameMap.id)

// 					// if(test) {
// 					//   this.logger.write(`Element already exist -> ${element.elementId}`, ansiColorCodes.bgRed)
// 					// }
// 				}
// 			})
// 		}

// 		if (gameMap.id === 154010883) {
// 			this.logger.write(
// 				`foundedElement -> ${foundedElement.length}`,
// 				ansiColorCodes.bgMagenta
// 			)
// 		}
// 		// await this.logger.writeAsync(
// 		// 	`Add -> ${gameMap.id}, nbElements: ${elements.size}, nbCells: ${cells.size}, version: ${gameMap.version}, subAreaId: ${gameMap.subareaId}`,
// 		// 	ansiColorCodes.bgYellow
// 		// )

// 		gameMap.elements = elements

// 		const mapData = gameMap.save()

// 		// await this.database.prisma.map.create({
// 		// 	data: {
// 		// 		id: mapData.id,
// 		// 		subAreaId: mapData.subareaId,
// 		// 		version: mapData.version,
// 		// 		leftNeighbourId: mapData.leftMap,
// 		// 		rightNeighbourId: mapData.rightMap,
// 		// 		topNeighbourId: mapData.topMap,
// 		// 		bottomNeighbourId: mapData.bottomMap,
// 		// 		cells: mapData.cells,
// 		// 		elements: mapData.elements,
// 		// 	},
// 		// })
// 	}
