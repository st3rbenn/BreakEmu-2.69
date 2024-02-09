import { PrismaClient } from "@prisma/client"
import Effect from "breakEmu_World/manager/entities/effect/Effect"
import { InteractiveTypeEnum } from "../breakEmu_Server/IO"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Logger from "../breakEmu_Core/Logger"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import BreedManager from "../breakEmu_World/manager/breed/BreedManager"
import EffectCollection from "../breakEmu_World/manager/entities/effect/EffectCollection"
import EffectDice from "../breakEmu_World/manager/entities/effect/EffectDice"
import EffectInteger from "../breakEmu_World/manager/entities/effect/EffectInteger"
import Cell from "../breakEmu_World/manager/map/cell/Cell"
import InteractiveElementModel from "./model/InteractiveElement.model"
import InteractiveSkill from "./model/InteractiveSkill.model"
import Breed from "./model/breed.model"
import CharacterItem from "./model/characterItem.model"
import Experience from "./model/experience.model"
import Finishmoves from "./model/finishmoves.model"
import Head from "./model/head.model"
import Item from "./model/item.model"
import ItemSet from "./model/itemSet.model"
import GameMap, { CellData, InteractiveElementData } from "./model/map.model"
import MapScrollAction from "./model/mapScrollAction.model"
import Skill from "./model/skill.model"
import Spell from "./model/spell.model"
import SpellLevel from "./model/spellLevel.model"
import World from "./model/world.model"

class Database {
	private static instance: Database
	public _logger: Logger = new Logger("Database")
	public prisma: PrismaClient

	private totalParameters: number = 0
	private loadedParameters: number = 0

	private static SkillsBonesIds: { [key: number]: number[] } = {
		45: [660], // Blé
		46: [661], // Houblon
		296: [660], // Blé
		50: [662], // Lin
		300: [662], // Lin
		54: [663], // Chanvre
		37: [654], // Erable
		102: [4938, 224], // Eau potable
		6: [650, 3715], // Frene
		57: [701], // Frène
		53: [664], // Orge
		68: [3212], // Ortie
		124: [1018], // Gougeon
		35: [659], // Orme
		24: [1081], // Fer
		69: [3213], // Sauge
		40: [652], // Noyer
		39: [651], // Chataignier
		125: [1019], // Truite
		56: [1078], // Manganèse
		55: [1077], // Etin
		26: [4921, 1074], // Bronze
		25: [4920, 1075], // Cuivre
		298: [4918], // Fer
		28: [1063], // Kobalte
		52: [665], // Seigle
		31: [1073], // Bauxite
		192: [1290], // Obsidienne
		30: [1079], // Or
		344: [3555], // Salikrone
		341: [3554], // Quisnoa
		347: [3552], // Patelle
		342: [3553], // Ecume de mer
		343: [3551], // Bois d'Aquajou
		33: [655], // Bois d'If
		10: [653], // Bois de Chêne
		139: [681], // Bois de Bombu
		141: [682], // Bois d'Oliviolet
		154: [685], // Bois de Bambou
		41: [656], // Bois de meurisier
		306: [3222], // Noisetier
		34: [657], // Ebène
		38: [658], // Charme
		174: [689], // Kaliptus
		155: [686], // Bambou sombre
		158: [1029], // Bambou sacré
		190: [1289], // Bois de Tremble
		74: [680], // Edelweiss
		237: [2345], // Cawotte Fraiche
		338: [677], // Trefle a 4 feuiles
		73: [679], // Orchidée
		58: [667], // Malt
		307: [3227, 3228], // Mais
		308: [3234], // Millet
		304: [3223], // Belladone
		160: [684], // Graine de Pandouille
		159: [5866], // Riz
		161: [2202], // Dolomite
		162: [2209, 1080], // Silicate
		191: [1245], // Frostiz
		303: [3230], // Ginseng
		188: [1288], // Perce-Neige
		325: [1839], // Bar Ricain plusieurs ressources, même bones...
		319: [1021], // Anguille plusieurs ressources, même bones...
		72: [678], // Menthe Sauvage
	}

	async patchInteractiveElements(): Promise<void> {
		const skills = Skill.getSkills()

		skills.forEach((skill) => {
			if (Database.SkillsBonesIds[skill.Id]) {
				console.log(
					`Skill: ${skill.Name} - Bones: ${Database.SkillsBonesIds[skill.Id]}`
				)
			}
		})
	}

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

	public async initialize(loadAll: boolean = false): Promise<boolean> {
		try {
			await this.prisma.$connect()
			const queryTestConnection = "SELECT 1 + 1;"

			await this.prisma.$executeRawUnsafe(queryTestConnection)

			if (loadAll) {
				await this.loadAll()
				await this._logger.writeAsync("Database initialized")
				return Promise.resolve(true)
			}

			await this._logger.writeAsync("Database initialized")
			return Promise.resolve(true)
		} catch (error) {
			await this._logger.writeAsync(
				`Error initializing database: ${error}`,
				"red"
			)
			return Promise.reject(error)
		}
	}

	public async loadAll(): Promise<void> {
		await Promise.all([
			this.loadWorlds(),
			this.loadHeads(),
			this.loadBreeds(),
			this.loadExperiences(),
			this.loadSkills(),
			this.loadSpells(),
			this.loadFinishMoves(),
			this.loadItems(),
			this.loadItemSets(),
			this.loadCharactersItems(),
			this.loadInteractiveSkills(),
			this.loadMapScrollActions(),
			this.loadInteractiveElements(),
			this.loadMaps(),
		])

		await Promise.resolve()
	}

	async loadWorlds(): Promise<void> {
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
		await this._logger.writeAsync(`Loaded ${World.worlds.length} worlds`)
		await Promise.resolve()
	}

	async loadHeads(): Promise<void> {
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
		await this._logger.writeAsync(`Loaded ${Head.heads.length} heads`)
		await Promise.resolve()
	}

	async loadBreeds(): Promise<void> {
		const breeds = await this.prisma.breed.findMany()
		for (const breed of breeds) {
			const spForIntelligence = Breed.statsPointParser(breed.spForIntelligence)
			const spForAgility = Breed.statsPointParser(breed.spForAgility)
			const spForStrength = Breed.statsPointParser(breed.spForStrength)
			const spForVitality = Breed.statsPointParser(breed.spForVitality)
			const spforWisdom = Breed.statsPointParser(breed.spforWisdom)
			const spForChance = Breed.statsPointParser(breed.spForChance)

			const breedRecord = new Breed(
				breed.id,
				breed.name,
				breed.maleLook,
				breed.femaleLook,
				breed.maleColors,
				breed.femaleColors,
				spForIntelligence,
				spForAgility,
				spForStrength,
				spForVitality,
				spforWisdom,
				spForChance,
				breed.startLifePoints,
				breed.breedSpellsId as string
			)

			BreedManager.getInstance().breeds.push(breedRecord)
		}
		await this._logger.writeAsync(
			`Loaded ${BreedManager.getInstance().breeds.length} breeds`
		)
		await Promise.resolve()
	}

	async loadExperiences(): Promise<void> {
		const experiences = await this.prisma.experience.findMany()
		for (const experience of experiences) {
			Experience.experienceLevels.push(
				new Experience(
					Number(experience.level),
					Number(experience.characterExperience),
					Number(experience.jobExperience),
					Number(experience.guildExperience),
					Number(experience.mountExperience)
				)
			)
		}
		await this._logger.writeAsync(
			`Loaded ${Experience.experienceLevels.length} levels`
		)
		await Promise.resolve()
	}

	async loadSkills(): Promise<void> {
		const skills = await this.prisma.skill.findMany()
		for (const skill of skills) {
			Skill.addSkill(
				new Skill(
					skill.id,
					skill.name,
					skill.parentJobId,
					skill.gatheredRessourceItem,
					skill.interactiveId,
					skill.levelMin
				)
			)
		}
		await this._logger.writeAsync(`Loaded ${Skill.getSkills().size} skills`)
		await Promise.resolve()
	}

	async loadSpells(): Promise<void> {
		const spells = await this.prisma.spell.findMany()
		const spellsLevel = await this.prisma.spellLevel.findMany()
		const spellVariant = await this.prisma.spellVariant.findMany()

		let step = 0
		for (const spell of spells) {
			Spell.addSpell(
				new Spell(
					spell.id,
					spell.name,
					spell.description,
					spell.verbose as boolean
				)
			)
		}

		step++

		for (const spellLevel of spellsLevel) {
			const minimumLevel = spellLevel.minPlayerLevel
			Spell.getSpellById(spellLevel.spellId)?.setMinimumLevel(minimumLevel)
			Spell.getSpellById(spellLevel.spellId)?.levels.set(
				spellLevel.grade,
				new SpellLevel(
					spellLevel.id,
					spellLevel.spellId,
					spellLevel.spellBreed,
					spellLevel.grade,
					spellLevel.minPlayerLevel,
					spellLevel.apCost,
					spellLevel.minRange,
					spellLevel.maxRange,
					spellLevel.castInLine,
					spellLevel.castInDiag,
					spellLevel.castTestLos,
					spellLevel.criticalHitProb,
					spellLevel.needFreeCell,
					spellLevel.needTakenCell,
					spellLevel.needFreeTrapCell,
					spellLevel.maxStack,
					spellLevel.maxCastPerTurn,
					spellLevel.maxCastPerTarget,
					spellLevel.minCastInterval,
					spellLevel.initialCooldown,
					spellLevel.globalCooldown,
					spellLevel.hideEffects,
					spellLevel.hidden
				)
			)
		}

		step++

		for (const variant of spellVariant) {
			const spellIds = variant.spellIds.split(",").map(Number)
			const spell = Spell.getSpellById(variant.id)
			if (spell) {
				spell.variant = Spell.getSpellById(spellIds[0]) as Spell
				spellIds.shift()
			}
		}

		step++

		if (step == 3) {
			await Promise.resolve()
		}

		await this._logger.writeAsync(`Loaded ${Spell.getSpells.size} spells`)
		await Promise.resolve()
	}

	async loadFinishMoves(): Promise<void> {
		const finishMoves = await this.prisma.finishMove.findMany()

		for (const finishMove of finishMoves) {
			Finishmoves.addFinishmoves(
				new Finishmoves(
					finishMove.id,
					finishMove.duration,
					finishMove.free,
					finishMove.name,
					finishMove.category,
					finishMove.spellLevel
				)
			)
		}

		await this._logger.writeAsync(
			`Loaded ${Finishmoves.finishmoves.size} finish moves`
		)
		await Promise.resolve()
	}

	async loadItemSets(): Promise<void> {
		const itemSets = await this.prisma.itemSet.findMany()

		for (const itemSet of itemSets) {
			let effectsCollection: EffectCollection[] = []
			const allEffects = JSON.parse(itemSet.effects as any) as Effect[][]

			for (const effect of allEffects) {
				if (effect.length > 1) {
					let effects: Effect[] = []
					for (const eff of effect) {
						const newEffect = new EffectDice(
							eff.effectId,
							eff.diceNum,
							eff.diceSide,
							eff.value,
							eff.order,
							eff.targetId,
							eff.targetMask,
							eff.duration,
							eff.delay,
							eff.random,
							eff.group,
							eff.modificator,
							eff.trigger,
							eff.rawTriggers,
							eff.rawZone,
							eff.dispellable
						)

						effects.push(newEffect)
					}

					effectsCollection.push(new EffectCollection(effects))
				}
			}

			ItemSet.addItemSet(
				new ItemSet(
					itemSet.id,
					itemSet.name,
					itemSet.items as number[],
					effectsCollection
				)
			)
		}

		await this._logger.writeAsync(`Loaded ${ItemSet.itemSets.size} itemSets`)
		await Promise.resolve()
	}

	async loadItems(): Promise<void> {
		const items = await this.prisma.item.findMany()

		for (const item of items) {
			let effects: EffectCollection = new EffectCollection([])
			const effs = (item.effects as any) as Effect[]

			for (const eff of effs) {
				effects.effects.set(
					eff.effectId,
					new EffectDice(
						eff.effectId,
						eff.diceNum,
						eff.diceSide,
						eff.value,
						eff.order,
						eff.targetId,
						eff.targetMask,
						eff.duration,
						eff.delay,
						eff.random,
						eff.group,
						eff.modificator,
						eff.trigger,
						eff.rawTriggers,
						eff.rawZone,
						eff.dispellable
					)
				)
			}

			Item.addItem(
				new Item(
					item.id,
					item.name,
					item.typeId,
					item.level,
					item.realWeight,
					item.cursed,
					item.usable,
					item.exchangeable,
					item.price,
					item.etheral,
					item.itemSetId,
					item.criteria,
					item.appearanceId,
					item.dropMonsterIds as number[],
					item.recipeSlots,
					item.recipeIds as number[],
					effects,
					item.craftXpRatio,
					item.isSaleable
				)
			)
		}

		await this._logger.writeAsync(`Loaded ${Item.items.size} items`)
		await Promise.resolve()
	}

	async loadCharactersItems(): Promise<void> {
		const charactersItems = await this.prisma.characterItem.findMany()

		for (const characterItem of charactersItems) {
			let effects: EffectCollection = new EffectCollection([])
			const effs = JSON.parse(
				characterItem.effects?.toString() as string
			) as Effect[]

			for (const eff of effs) {
				effects.effects.set(
					eff.effectId,
					new EffectInteger(
						eff.effectId,
						eff.order,
						eff.targetId,
						eff.targetMask,
						eff.duration,
						eff.delay,
						eff.random,
						eff.group,
						eff.modificator,
						eff.trigger,
						eff.rawTriggers,
						eff.rawZone,
						eff.dispellable,
						eff.value
					)
				)
			}

			await CharacterItem.addItem(
				new CharacterItem(
					characterItem.characterId,
					characterItem.uid,
					characterItem.gid,
					characterItem.quantity,
					characterItem.position,
					characterItem.look || "",
					effects,
					characterItem.appearanceId
				)
			)
		}

		await this._logger.writeAsync(
			`Loaded ${CharacterItem.charactersItems.size} characters items`,
			ansiColorCodes.bgRed
		)
		await Promise.resolve()
	}

	async loadInteractiveSkills(): Promise<void> {
		const interactiveSkills = await this.prisma.interactiveSkill.findMany()

		for (const interactiveSkill of interactiveSkills) {
			const is = new InteractiveSkill(
				interactiveSkill.id,
				interactiveSkill.mapId,
				interactiveSkill.identifier,
				interactiveSkill.actionIdentifier as any,
				interactiveSkill.type,
				interactiveSkill.skillId as any,
				interactiveSkill.param1,
				interactiveSkill.param2,
				interactiveSkill.param3,
				interactiveSkill.criteria
			)

			InteractiveSkill.interactiveSkills.set(is.identifier, is)
		}

		await this._logger.writeAsync(
			`Loaded ${InteractiveSkill.interactiveSkills.size} interactive skills`,
			ansiColorCodes.bgRed
		)
		await Promise.resolve()
	}

	async loadMapScrollActions(): Promise<void> {
		const mapScrollActions = await this.prisma.mapScrollAction.findMany()

		for (const mapScrollAction of mapScrollActions) {
			const msa = new MapScrollAction(
				mapScrollAction.id,
				mapScrollAction.rightMapId,
				mapScrollAction.leftMapId,
				mapScrollAction.topMapId,
				mapScrollAction.bottomMapId
			)

			MapScrollAction.setMapScrollAction(msa)
		}

		await this._logger.writeAsync(
			`Loaded ${MapScrollAction.mapScrollActions.size} map scroll actions`,
			ansiColorCodes.bgRed
		)
		await Promise.resolve()
	}

	async loadInteractiveElements(): Promise<void> {
		const interactiveElements = await this.prisma.interactiveElement.findMany()

		for (const el of interactiveElements) {
			const ie = new InteractiveElementModel(
				el.id,
				el.elementId,
				el.cellId,
				el.mapId,
				el.gfxId,
				el.bonesId
			)

      ie.skill = InteractiveSkill.interactiveSkills.get(el.elementId) as InteractiveSkill

			InteractiveElementModel.interactiveCells.set(el.elementId, ie)
		}

		await this._logger.writeAsync(
			`Loaded ${
				InteractiveElementModel.getInteractiveCells().size
			} interactive elements`,
			ansiColorCodes.bgRed
		)
	}

	async loadMaps(): Promise<void> {
		try {
			const step = 1500 // Nombre de cartes à charger à chaque étape

			const count = await this.prisma.map.count() // Nombre total de cartes

			let loadedMaps = 0 // Nombre de cartes déjà chargées

			while (loadedMaps < count) {
				const maps = await this.prisma.map.findMany({
					take: step,
					skip: loadedMaps,
				})

				for (const map of maps) {
					const gameMap = new GameMap(
						map.id,
						map.subAreaId,
						map.version,
						map.leftNeighbourId,
						map.rightNeighbourId,
						map.topNeighbourId,
						map.bottomNeighbourId
					)

					let cells: CellData[] = JSON.parse(map.cells as string)

					for (const cell of cells) {
						const c = new Cell(
							cell.id,
							cell.blue,
							cell.red,
							cell.losMov,
							cell.mapChangeData
						)

						gameMap.cells.set(c.id, c)
					}

					let elements: InteractiveElementData[] = JSON.parse(
						map.elements as string
					)

					for (const el of elements) {
						const ie = InteractiveElementModel.getInteractiveCell(el.elementId)
						if (ie) {
							await gameMap.instance.addElement(ie)
						}
					}

					GameMap.maps.set(gameMap.id, gameMap)
				}

				loadedMaps += maps.length
				await this.updateProgress(count, loadedMaps)
			}
		} catch (error) {
			await this._logger.writeAsync(
				`Error loading maps: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}

		await this._logger.writeAsync(
			`Loaded ${GameMap.maps.size} maps`,
			ansiColorCodes.bgRed
		)

		// await this.patchInteractiveElements()
	}

	private async updateProgress(max: number, loaded: number) {
		this.totalParameters = max
		this.loadedParameters = loaded
		const progressPercent = (this.loadedParameters / this.totalParameters) * 100
		await this._logger.writeAsync(
			`Loading progress: ${progressPercent.toFixed(2)}%`
		)
		await new Promise((resolve) => setTimeout(resolve, 10))
	}
}

export default Database
