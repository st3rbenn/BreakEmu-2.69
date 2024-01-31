import { PrismaClient } from "@prisma/client"
import Logger from "../breakEmu_Core/Logger"
import ConfigurationManager from "../breakEmu_Core/configuration/ConfigurationManager"
import BreedManager from "../breakEmu_World/manager/breed/BreedManager"
import Breed from "./model/breed.model"
import Experience from "./model/experience.model"
import Head from "./model/head.model"
import World from "./model/world.model"
import Skill from "./model/skill.model"
import Spell from "./model/spell.model"
import SpellLevel from "./model/spellLevel.model"
import Finishmoves from "./model/finishmoves.model"
import ItemSet from "./model/itemSet.model"
import EffectCollection from "../breakEmu_World/manager/entities/effect/EffectCollection"
import { ansiColorCodes } from "../breakEmu_Core/Colors"
import Effect from "breakEmu_World/manager/entities/effect/Effect"
import Item from "./model/item.model"
import CharacterItem from "./model/characterItem.model"
import EffectDice from "../breakEmu_World/manager/entities/effect/EffectDice"
import EffectInteger from "../breakEmu_World/manager/entities/effect/EffectInteger"
import InteractiveSkill from "./model/InteractiveSkill.model";
import {GenericActionEnum} from "../breakEmu_Server/IO";
import InteractiveElementModel from "./model/InteractiveElement.model";

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
			this.prisma.$connect(),
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
			this.loadInteractiveElements(),
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
		this._logger.writeAsync(`Loaded ${World.worlds.length} worlds`)
		Promise.resolve()
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
		this._logger.writeAsync(`Loaded ${Head.heads.length} heads`)
		Promise.resolve()
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
		this._logger.writeAsync(
			`Loaded ${BreedManager.getInstance().breeds.length} breeds`
		)
		Promise.resolve()
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
		this._logger.writeAsync(
			`Loaded ${Experience.experienceLevels.length} levels`
		)
		Promise.resolve()
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
		this._logger.writeAsync(`Loaded ${Skill.getSkills().size} skills`)
		Promise.resolve()
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
			Promise.resolve()
		}

		this._logger.writeAsync(`Loaded ${Spell.getSpells.size} spells`)
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

		this._logger.writeAsync(
			`Loaded ${Finishmoves.finishmoves.size} finish moves`
		)
	}

	async loadItemSets(): Promise<void> {
		const itemSets = await this.prisma.itemSet.findMany()

		for (const itemSet of itemSets) {
			let effectsCollection: EffectCollection[] = []
			const allEffects = JSON.parse(itemSet.effects as any) as Effect[][]

			for (const effect of allEffects) {
				if (effect.length > 1) {
          let effects: Effect[] = []
          for(const eff of effect) {
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

		this._logger.writeAsync(`Loaded ${ItemSet.itemSets.size} itemSets`)
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

		this._logger.writeAsync(`Loaded ${Item.items.size} items`)
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

		this._logger.writeAsync(
			`Loaded ${CharacterItem.charactersItems.size} characters items`,
			ansiColorCodes.bgRed
		)
	}

	async loadInteractiveSkills(): Promise<void> {
		const interactiveSkills = await this.prisma.interactiveSkill.findMany()

		for(const interactiveSkill of interactiveSkills) {
			const is = new InteractiveSkill(
				interactiveSkill.id,
				interactiveSkill.mapId,
				interactiveSkill.identifier,
				interactiveSkill.actionIdentifier,
				interactiveSkill.type,
				interactiveSkill.skillId,
				interactiveSkill.param1,
				interactiveSkill.param2,
				interactiveSkill.param3,
				interactiveSkill.criteria
			)

			InteractiveSkill.interactiveSkills.set(is.id, is)
		}

		this._logger.writeAsync(
			`Loaded ${InteractiveSkill.interactiveSkills.size} interactive skills`,
			ansiColorCodes.bgRed
		)
	}

	async loadInteractiveElements(): Promise<void> {
		const interactiveElements = await this.prisma.interactiveElement.findMany()

		for(const interactiveElement of interactiveElements) {
			const ie = new InteractiveElementModel(
				interactiveElement.elementId,
				interactiveElement.cellId,
				interactiveElement.mapId,
				interactiveElement.gfxId,
				interactiveElement.bonesId
			)

			InteractiveElementModel.addInteractiveCell(interactiveElement.id, ie)
		}

		this._logger.writeAsync(
			`Loaded ${InteractiveElementModel.interactiveCells.size} interactive elements`,
			ansiColorCodes.bgRed
		)
	}
}

export default Database
