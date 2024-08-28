import { PrismaClient } from "@prisma/client"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import InteractiveElementBonus from "@breakEmu_Core/bull/tasks/BonusTask"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import { GenericActionEnum, InteractiveTypeEnum } from "@breakEmu_Protocol/IO"
import AchievementManager from "@breakEmu_World/manager/achievement/AchievementManager"
import BreedManager from "@breakEmu_World/manager/breed/BreedManager"
import Effect from "@breakEmu_World/manager/entities/effect/Effect"
import EffectCollection from "@breakEmu_World/manager/entities/effect/EffectCollection"
import EffectDice from "@breakEmu_World/manager/entities/effect/EffectDice"
import MapPoint from "@breakEmu_World/manager/map/MapPoint"
import Cell from "@breakEmu_World/manager/map/cell/Cell"
import InteractiveElementModel from "./model/InteractiveElement.model"
import InteractiveSkill from "./model/InteractiveSkill.model"
import Achievement from "./model/achievement.model"
import AchievementObjective from "./model/achievementObjective.model"
import AchievementReward from "./model/achievementReward.model"
import Breed from "./model/breed.model"
import Experience from "./model/experience.model"
import Finishmoves from "./model/finishmoves.model"
import Head from "./model/head.model"
import Item from "./model/item.model"
import ItemSet from "./model/itemSet.model"
import GameMap, { CellData } from "./model/map.model"
import MapScrollAction from "./model/mapScrollAction.model"
import Skill from "./model/skill.model"
import Spell from "./model/spell.model"
import SpellLevel from "./model/spellLevel.model"
import World from "./model/world.model"
import SubArea from "./model/SubArea.model"
import Recipe from "./model/recipe.model"

interface test {
	id: number
	elementId: number
	mapId: number
	cellId: number
	elementType: number
	gfxId: number
	bonesId: number
}
interface Is {
	id: number
	mapId: number
	identifier: number
	actionIdentifier: string
	type: string
	skillId: string
	param1: string
	param2: string
	param3: string
	criteria: string
}

class Database {
	private static instance: Database
	public logger: Logger = new Logger("Database")
	public prisma: PrismaClient

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
			this.logger.write("Query: " + e.query)
			this.logger.write("Params: " + e.params)
			this.logger.write("Duration: " + e.duration + "ms")
		})
	}

	public async initialize(loadAll: boolean = false): Promise<boolean> {
		try {
			await this.prisma.$connect()
			const queryTestConnection = "SELECT 1 + 1;"

			await this.prisma.$executeRawUnsafe(queryTestConnection)

			if (loadAll) {
				await this.loadAll()
				await this.logger.writeAsync("Database initialized")
				return Promise.resolve(true)
			}

			await this.logger.writeAsync("Database initialized")
			return Promise.resolve(true)
		} catch (error) {
			await this.logger.writeAsync(
				`Error initializing database: ${error}`,
				"red"
			)
			return Promise.reject(error)
		}
	}

	public async loadAll(): Promise<void> {
		try {
			await this.loadAchievements()
			await this.loadSkills()
			await this.loadInteractiveSkills()
      await this.loadItemSets()
      await this.loadItems()
			await this.loadRecipes()
			await Promise.all([
				this.loadWorlds(),
				this.loadHeads(),
				this.loadBreeds(),
				this.loadExperiences(),
				this.loadSpells(),
				this.loadFinishMoves(),
				this.loadAchievementObjectives(),
				this.loadSubAreas(),
				this.loadMapScrollActions(),
				this.loadInteractiveElements(),
			])

			await this.loadMaps(), await Promise.resolve()
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading all: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadWorlds(): Promise<void> {
		/* Load all worlds */

		try {
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
			await this.logger.writeAsync(`Loaded ${World.worlds.length} worlds`)
			await Promise.resolve()
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading worlds: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadHeads(): Promise<void> {
		try {
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
			await this.logger.writeAsync(`Loaded ${Head.heads.length} heads`)
			await Promise.resolve()
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading heads: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadBreeds(): Promise<void> {
		try {
			const breeds = await this.prisma.breed.findMany()
			for (const breed of breeds) {
				const spForIntelligence = Breed.statsPointParser(
					breed.spForIntelligence
				)
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
			await this.logger.writeAsync(
				`Loaded ${BreedManager.getInstance().breeds.length} breeds`
			)
			await Promise.resolve()
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading breeds: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadExperiences(): Promise<void> {
		try {
			const experiences = await this.prisma.experience.findMany()
			let exps = new Map<number, Experience>()
			for (const experience of experiences) {
				const newEXP = new Experience(
					Number(experience.level),
					Number(experience.characterExperience),
					Number(experience.jobExperience),
					Number(experience.guildExperience),
					Number(experience.mountExperience)
				)

				exps.set(Number(experience.level), newEXP)
			}

			Experience.experienceLevels = exps

			await this.logger.writeAsync(
				`Loaded ${Experience.experiences.size} levels`
			)
			await Promise.resolve()
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading experiences: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadSkills(): Promise<void> {
		try {
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
			await this.logger.writeAsync(`Loaded ${Skill.getSkills().size} skills`)
			await Promise.resolve()
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading skills: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadSpells(): Promise<void> {
		try {
			const spells = await this.prisma.spell.findMany()
			const spellsLevel = await this.prisma.spellLevel.findMany()
			const spellVariants = await this.prisma.spellVariant.findMany()

			// Chargement des sorts
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

			// Mise à jour des niveaux de sort
			for (const spellLevel of spellsLevel) {
				Spell.getSpellById(spellLevel.spellId)?.setMinimumLevel(
					spellLevel.minPlayerLevel
				)
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

			// Association des variantes de sort
			for (const variant of spellVariants) {
				const spellIds = variant.spellIds.split(",").map(Number)
				const primarySpell = Spell.getSpellById(spellIds[0])

				// Supposons que chaque sort peut avoir une liste de variantes
				if (primarySpell) {
					for (let i = 1; i < spellIds.length; i++) {
						const variantSpell = Spell.getSpellById(spellIds[i])
						if (variantSpell) {
							primarySpell.addVariant(variantSpell) // Supposons que cette méthode existe pour ajouter une variante à un sort
						}
					}
				}
			}

			await this.logger.writeAsync(`Loaded ${Spell.getSpells.size} spells`)
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading spells: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadFinishMoves(): Promise<void> {
		try {
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

			await this.logger.writeAsync(
				`Loaded ${Finishmoves.finishmoves.size} finish moves`
			)
			await Promise.resolve()
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading finish moves: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadItemSets(): Promise<void> {
		try {
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

			await this.logger.writeAsync(`Loaded ${ItemSet.itemSets.size} itemSets`)
			await Promise.resolve()
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading item sets: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadItems(): Promise<void> {
		try {
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

				const newItem = new Item(
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

				if (item.itemSetId !== -1) {
					const itemSet = ItemSet.getItemSet(item.itemSetId)
					if (itemSet) {
						newItem.itemSet = itemSet
					}
				}

				Item.addItem(newItem)
			}

			await this.logger.writeAsync(`Loaded ${Item.items.size} items`)
			await Promise.resolve()
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading items: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadInteractiveSkills(): Promise<void> {
		try {
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

				const skill = Skill.getSkill(is.skillId)

				if (skill) {
					is.record = skill
				}

				InteractiveSkill.interactiveSkills.set(interactiveSkill.id, is)
			}

			await this.logger.writeAsync(
				`Loaded ${InteractiveSkill.interactiveSkills.size} interactive skills`
			)
			await Promise.resolve()
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading interactive skills: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadMapScrollActions(): Promise<void> {
		try {
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

			await this.logger.writeAsync(
				`Loaded ${MapScrollAction.mapScrollActions.size} map scroll actions`
			)
			await Promise.resolve()
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading map scroll actions: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadInteractiveElements(): Promise<void> {
		try {
			const interactiveElements = await this.prisma.interactiveElement.findMany()

			for (const el of interactiveElements) {
				const ie = new InteractiveElementModel(
					el.id,
					el.elementId,
					el.cellId,
					el.mapId,
					el.gfxId,
					el.bonesId,
					el.elementType
				)

				const sk = InteractiveSkill.getByIdentifier(el.elementId)

				if (sk) {
					ie.skill = sk
				}

				if (ie.stated) {
					ie.bonusTask = new InteractiveElementBonus(ie)
					ie.bonusTask.setCron("*/300 * * * *").run()
				}

				InteractiveElementModel.interactiveCells.set(el.id, ie)
			}

			await this.logger.writeAsync(
				`Loaded ${
					InteractiveElementModel.getInteractiveCells().size
				} interactive elements`
			)
			await Promise.resolve()
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading interactive elements: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadAchievements(): Promise<void> {
		const [achievements, allObjectives, allRewards] = await Promise.all([
			this.prisma.achievement.findMany(),
			this.prisma.achievementObjective.findMany(),
			this.prisma.achievementReward.findMany(),
		])

		const objectivesMap = new Map<number, AchievementObjective[]>()
		const rewardsMap = new Map<number, AchievementReward[]>()

		for (const obj of allObjectives) {
			if (!objectivesMap.has(obj.achievementId)) {
				objectivesMap.set(obj.achievementId, [])
			}
			objectivesMap
				.get(obj.achievementId)!
				.push(
					new AchievementObjective(
						obj.id,
						obj.order,
						obj.achievementId,
						obj.criterion
					)
				)
		}

		for (const rew of allRewards) {
			if (!rewardsMap.has(rew.achievementId)) {
				rewardsMap.set(rew.achievementId, [])
			}
			rewardsMap
				.get(rew.achievementId)!
				.push(
					new AchievementReward(
						rew.id,
						rew.criteria,
						rew.kamasRatio,
						rew.experienceRatio,
						rew.kamasScaleWithPlayerLevel,
						rew.itemsReward?.toString().split(",").map(Number) || [],
						rew.itemsQuantityReward?.toString().split(",").map(Number) || [],
						rew.emotesReward?.toString().split(",").map(Number) || [],
						rew.titlesReward?.toString().split(",").map(Number) || [],
						rew.ornamentsReward?.toString().split(",").map(Number) || []
					)
				)
		}

		for (const achiev of achievements) {
			const achievObjectives = objectivesMap.get(achiev.id) || []
			const achievRewards = rewardsMap.get(achiev.id) || []

			const objectivesMapForAchiev = new Map<number, AchievementObjective>()
			const rewardsMapForAchiev = new Map<number, AchievementReward>()

			for (const obj of achievObjectives) {
				objectivesMapForAchiev.set(obj.id, obj)
			}

			for (const rew of achievRewards) {
				rewardsMapForAchiev.set(rew.id, rew)
			}

			const res = new Achievement(
				achiev.id,
				achiev.name,
				achiev.description,
				achiev.categoryId,
				achiev.points,
				achiev.level,
				achiev.order,
				achiev.accountLinked,
				objectivesMapForAchiev,
				rewardsMapForAchiev
			)

			AchievementManager.achievements.set(achiev.id, res)
		}

		await this.logger.writeAsync(
			`Loaded ${AchievementManager.achievements.size} achievements`
		)
	}

	async loadSubAreas(): Promise<void> {
		try {
			const subAreas = await this.prisma.subArea.findMany()

			for (const subArea of subAreas) {
				const subAreaRecord = new SubArea(
					subArea.id,
					subArea.name,
					subArea.areaId,
					subArea.level,
					subArea.monsterIds.split(",").map(Number),
					subArea.questsIds.split(",").map(Number),
					subArea.npcIds.split(",").map(Number),
					subArea.associatedZaapMapId,
					subArea.explorationAchievementId
				)

				SubArea.subAreas.set(subArea.id, subAreaRecord)
			}

			await this.logger.writeAsync(`Loaded ${SubArea.subAreas.size} subareas`)
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading subareas: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadMaps(): Promise<void> {
		try {
			const step = 1500
			const count = await this.prisma.map.count()
			let loadedMaps = 0

			while (loadedMaps < count) {
				const maps = await this.prisma.map.findMany({
					take: step,
					skip: loadedMaps,
				})

				// Crée un tableau de promesses pour le traitement de chaque carte
				const mapPromises = maps.map(async (map) => {
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
					cells.forEach((cell) => {
						const c = new Cell(
							cell.id,
							cell.blue,
							cell.red,
							cell.losMov,
							cell.mapChangeData
						)
						gameMap.cells.set(c.id, c)
					})

					const allInteractiveElements = Array.from(
						InteractiveElementModel.interactiveCells.values()
					)
					const foundedInteractives = allInteractiveElements.filter(
						(el) => el.mapId === gameMap.id
					)

					// Utilise Promise.all pour ajouter tous les éléments interactifs en parallèle
					await Promise.all(
						foundedInteractives.map((el) => {
							if (el.elementType === InteractiveTypeEnum.TYPE_ZAAP) {
								gameMap.hasZaap = true
								gameMap.zaapCell = new MapPoint(el.cellId)
							} else if (el.elementType === -1 || el.gfxId !== -1) {
								if (el.skill) {
									el.skill.skillId = 114
									el.skill.actionIdentifier = GenericActionEnum.Teleport
								}
							}

							if (el.bonesId !== -1) {
								const bonesIds = Database.SkillsBonesIds[el.elementId]
								if (bonesIds) {
									el.bonesId =
										bonesIds[Math.floor(Math.random() * bonesIds.length)]
								}
							}

							gameMap.instance().addElement(el)
						})
					)

					GameMap.maps.set(gameMap.id, gameMap)
				})

				// Exécute toutes les promesses de map en parallèle
				await Promise.all(mapPromises)

				loadedMaps += maps.length
				this.logger.updateProgress(count, loadedMaps)
			}
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading maps: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}

		await this.logger.writeAsync(`Loaded ${GameMap.maps.size} maps`)
	}

	async loadAchievementObjectives(): Promise<void> {
		try {
			const objectives = await this.prisma.achievementObjective.findMany()

			for (const obj of objectives) {
				const achievementObjective = new AchievementObjective(
					obj.id,
					obj.order,
					obj.achievementId,
					obj.criterion
				)
				AchievementManager.achievementObjectives.set(
					obj.id,
					achievementObjective
				)
			}

			await this.logger.writeAsync(
				`Loaded ${AchievementManager.achievementObjectives.size} achievement objectives`
			)
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading achievement objectives: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}

	async loadRecipes(): Promise<void> {
		try {
			const recipes = await this.prisma.recipe.findMany()

			for (const recipe of recipes) {
				const ingredients: Array<{
					id: number
					quantity: number
				}> = []

				const ingredientsArray = recipe.ingredients as number[]
				const quantitesArray = recipe.quantities as number[]

				for (let i = 0; i < ingredientsArray.length; i++) {
					ingredients.push({
						id: ingredientsArray[i],
						quantity: quantitesArray[i],
					})
				}

				const rec = new Recipe(
					recipe.id,
					recipe.resultId,
					recipe.resultName,
					recipe.resultType,
					recipe.resultLevel,
					ingredients,
					recipe.jobId,
					recipe.skillId
				)

				rec.resultItem = Item.getItem(recipe.resultId)

				Recipe.recipes.set(recipe.id, rec)
			}

			await this.logger.writeAsync(`Loaded ${Recipe.recipes.size} recipes`)
		} catch (error) {
			await this.logger.writeAsync(
				`Error loading recipes: ${(error as any).stack}`,
				ansiColorCodes.red
			)
		}
	}
}

export default Database
