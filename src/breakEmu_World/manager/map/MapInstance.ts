import InteractiveElementModel from "../../../breakEmu_API/model/InteractiveElement.model"
import Character from "../../../breakEmu_API/model/character.model"
import GameMap from "../../../breakEmu_API/model/map.model"
import {
	DofusMessage,
	FightCommonInformations,
	FightStartingPositions,
	GameContextRemoveElementMessage,
	GameRolePlayShowActorMessage,
	HouseInformations,
	InteractiveElement,
	InteractiveElementUpdatedMessage,
	InteractiveTypeEnum,
	InteractiveUseErrorMessage,
	InteractiveUsedMessage,
	MapComplementaryInformationsDataMessage,
	MapObstacle,
	StatedElement,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../WorldClient"
import Entity from "../entities/Entity"
import SkillManager from "../skills/SkillManager"
import MapElement from "./element/MapElement"
import MapInteractiveElement from "./element/MapInteractiveElement"
import MapStatedElement from "./element/MapStatedElement"
import GatherElementHandler from "./element/interactiveElement/GatherElementHandler"
import IInteractiveElementHandler from "./element/interactiveElement/IInteractiveElementHandler"
import ZaapHandler from "./element/interactiveElement/ZaapHandler"

class MapInstance {
	/*get monsterGroupCount(): number {
        return this.getEntities(MonsterGroup)
    }*/

	private entities: Map<any, Entity> = new Map()
	public elements: Map<any, MapElement> = new Map()

	handlers: Partial<Record<InteractiveTypeEnum, IInteractiveElementHandler>> = {
		[InteractiveTypeEnum.TYPE_WHEAT]: new GatherElementHandler(),
		[InteractiveTypeEnum.TYPE_NETTLE]: new GatherElementHandler(),
		[InteractiveTypeEnum.TYPE_GUDGEON]: new GatherElementHandler(),
		[InteractiveTypeEnum.TYPE_ASH]: new GatherElementHandler(),
		[InteractiveTypeEnum.TYPE_IRON]: new GatherElementHandler(),
		[InteractiveTypeEnum.TYPE_GRAWN]: new GatherElementHandler(),
		// Les autres types de récolte peuvent également être mappés au GatherElementHandler
		[InteractiveTypeEnum.TYPE_ZAAP]: new ZaapHandler(),
		[InteractiveTypeEnum.TYPE_ZAAPI]: new ZaapHandler(),
		// Ajoutez d'autres mappings au besoin
	}

	public mute: boolean = false

	public record: GameMap

	constructor(map: GameMap) {
		this.record = map

		this.record.elements.forEach((element: InteractiveElementModel) => {
			this.addElement(element)
		})
	}

	get charactersCount(): number {
		return this.getEntities<Character>(Character).length
	}

	public getEntities<T>(type: { new (...args: any[]): T }): T[] {
		let entities: T[] = []

		this.entities.forEach((entity: Entity) => {
			if (entity instanceof type) {
				entities.push(entity)
			}
		})

		return entities
	}

	public getElements<T>(type: { new (...args: any[]): T }): T[] {
		let elements: T[] = []

		this.elements.forEach((element: MapElement) => {
			if (element instanceof type) {
				elements.push(element)
			}
		})

		return elements
	}

	public async addEntity(entity: Entity) {
		try {
			console.log(
				`Add entity: (${entity.name}) on map: (${this.record.id}) at cell: (${entity.cellId})`
			)
			if (this.entities.has(entity.id)) {
				return
			}

			this.entities.set(entity.id, entity)

			let actorInformations = entity.getActorInformations()
			await this.send(new GameRolePlayShowActorMessage(actorInformations))
		} catch (error) {
			console.log(error)
		}
	}

	public addElement(element: InteractiveElementModel) {
		const elem = element.getMapElement(this)
		this.elements.set(element.elementId, elem)
	}

	public async removeEntity(entity: Entity) {
		try {
			let entityId = entity.id
			await this.send(new GameContextRemoveElementMessage(entityId))
			this.entities.delete(entity.id)
		} catch (error) {
			console.log(error)
		}
	}

	public async sendMapComplementaryInformations(
		client: WorldClient
	): Promise<void> {
		try {
			const entities = this.getEntities<Character>(Character).map(
				(character: Character) => {
					return character.getActorInformations()
				}
			)

			const interactiveElements = this.getInteractiveElements(
				client?.selectedCharacter
			)

			const statedElements = this.getStatedElements()

			const houses: HouseInformations[] = []
			const obstacles: MapObstacle[] = []
			const fightCommonInformations: FightCommonInformations[] = []

			const mapComplementary = new MapComplementaryInformationsDataMessage(
				this.record.subareaId,
				this.record.id,
				houses,
				entities,
				interactiveElements,
				statedElements,
				obstacles,
				fightCommonInformations,
				false,
				new FightStartingPositions([0], [0])
			)

			await client.Send(mapComplementary)
		} catch (error) {
			console.log(error)
		}
	}

	public getStatedElements(): StatedElement[] {
		return this.getElements<MapStatedElement>(
			MapStatedElement
		).map((element: MapStatedElement) => element.getStatedElement())
	}

	public getInteractiveElements(character: Character): InteractiveElement[] {
		return this.getElements<MapInteractiveElement>(
			MapInteractiveElement
		).map((element: MapInteractiveElement) =>
			element.getInteractiveElement(character)
		)
	}

	public async send(message: DofusMessage) {
		try {
			for (const player of this.getEntities<Character>(Character)) {
				await player.client?.Send(message)
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async useInteractiveElement(
		character: Character,
		elementId: number,
		skillInstanceUid: number
	) {
		try {
			const element = this.getElements<MapElement>(MapElement as any).find(
				(element: MapElement) => element.record.elementId === elementId
			)

			console.log(
				"use interactive element",
				elementId,
				skillInstanceUid,
				element?.record?.skill?.type
			)

			if (!element) {
				await character.client?.Send(
					new InteractiveUseErrorMessage(elementId, skillInstanceUid)
				)
				return
			}

			if (!element.caneUse(character) && character.busy) {
				await character.client?.Send(
					new InteractiveUseErrorMessage(elementId, skillInstanceUid)
				)
				return
			}

			console.log("TYPE", element?.record?.skill?.type)

			await character.sendMap(
				new InteractiveUsedMessage(
					character.id,
					element.record.elementId,
					element.record.skill.skillId,
					element instanceof MapStatedElement ? SkillManager.SKILL_DURATION : 0,
					true
				)
			)

			const type = element?.record?.skill?.type
			const handler = this.handlers[type as InteractiveTypeEnum]

			if (handler) {
				await handler.handle(element, character)
			} else if (
				type === 0 &&
				element?.record?.skill?.param1 !== undefined &&
				element?.record?.skill?.param2 !== undefined
			) {
				// Traitement spécifique pour le type 0
				await character.teleport(
					parseInt(element?.record?.skill?.param1),
					parseInt(element?.record?.skill?.param2)
				)
			} else {
				// Gérer l'erreur ou le cas par défaut
				await character.client?.Send(
					new InteractiveUseErrorMessage(elementId, skillInstanceUid)
				)
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async refresh(interactiveElement: InteractiveElement) {
		try {
			await this.send(new InteractiveElementUpdatedMessage(interactiveElement))
		} catch (error) {
			console.log(error)
		}
	}

	public async isCharacterBlocked(character: Character): Promise<boolean> {
		return !this.record.isCellBlocked(character.cellId)
	}
}

export default MapInstance

// enum InteractiveTypeEnum {
// 	TYPE_ASH = 1,
// 	TYPE_SAW = 2,
// 	TYPE_OAK = 8,
// 	TYPE_CRAFTING_TABLE = 11,
// 	TYPE_WORKSHOP = 12,
// 	TYPE_BENCH = 13,
// 	TYPE_CAULDRON = 15,
// 	TYPE_ZAAP = 16,
// 	TYPE_IRON = 17,
// 	TYPE_OVEN = 22,
// 	TYPE_SILVER = 24,
// 	TYPE_GOLD = 25,
// 	TYPE_BAUXITE = 26,
// 	TYPE_MOULD = 27,
// 	TYPE_YEW = 28,
// 	TYPE_EBONY = 29,
// 	TYPE_ELM = 30,
// 	TYPE_MAPLE = 31,
// 	TYPE_HORNBEAM = 32,
// 	TYPE_CHESTNUT = 33,
// 	TYPE_WALNUT = 34,
// 	TYPE_CHERRY = 35,
// 	TYPE_COBALT = 37,
// 	TYPE_WHEAT = 38,
// 	TYPE_HOP = 39,
// 	TYPE_MILL = 40,
// 	TYPE_GRIND = 41,
// 	TYPE_FLAX = 42,
// 	TYPE_BARLEY = 43,
// 	TYPE_RYE = 44,
// 	TYPE_OATS = 45,
// 	TYPE_HEMP = 46,
// 	TYPE_MALT = 47,
// 	TYPE_POTATO_HEAP = 48,
// 	TYPE_POTATO_TABLE = 49,
// 	TYPE_CRUSHER = 50,
// 	TYPE_TIN = 52,
// 	TYPE_COPPER = 53,
// 	TYPE_MANGANESE = 54,
// 	TYPE_BRONZE = 55,
// 	TYPE_FOUNTAIN_OF_YOUTH = 56,
// 	TYPE_ANVIL = 57,
// 	TYPE_SEWING_MACHINE = 58,
// 	TYPE_POT = 60,
// 	TYPE_EDELWEISS = 61,
// 	TYPE_ALEMBIC = 62,
// 	TYPE_SPELT = 64,
// 	TYPE_SORGHUM = 65,
// 	TYPE_WILD_MINT = 66,
// 	TYPE_FIVE_LEAF_CLOVER = 67,
// 	TYPE_FREYESQUE_ORCHID = 68,
// 	TYPE_MORTAR_AND_PESTLE = 69,
// 	TYPE_DOOR = 70,
// 	TYPE_GRAWN = 71,
// 	TYPE_AGGRESSIVE_SALMOON = 72,
// 	TYPE_OCTOPWUS = 73,
// 	TYPE_TROUT = 74,
// 	TYPE_GUDGEON = 75,
// 	TYPE_KITTENFISH = 76,
// 	TYPE_CRAB = 77,
// 	TYPE_BREADED_FISH = 78,
// 	TYPE_EDIEM_CARP = 79,
// 	TYPE_SLUDGY_TROUT = 80,
// 	TYPE_SHINY_SARDINE = 81,
// 	TYPE_COTTON = 82,
// 	TYPE_SPINNER = 83,
// 	TYPE_WELL = 84,
// 	TYPE_SAFE = 85,
// 	TYPE_WOODEN_BENCH = 88,
// 	TYPE_MAGIC_ANVIL = 92,
// 	TYPE_MUNSTER_CRUSHER = 93,
// 	TYPE_WORKBENCH = 94,
// 	TYPE_BOMBU = 98,
// 	TYPE_STRANGE_SHADOW = 99,
// 	TYPE_SNAPPER = 100,
// 	TYPE_OLIVIOLET = 101,
// 	TYPE_STRENGTH_MACHINE = 102,
// 	TYPE_PYROTECHNIC_WORKBENCH = 103,
// 	TYPE_QUAQUACK = 104,
// 	TYPE_TRASH = 105,
// 	TYPE_ZAAPI = 106,
// 	TYPE_SHIELD_ANVIL = 107,
// 	TYPE_BAMBOO = 108,
// 	TYPE_DARK_BAMBOO = 109,
// 	TYPE_HOLY_BAMBOO = 110,
// 	TYPE_RICE = 111,
// 	TYPE_PANDKIN = 112,
// 	TYPE_DOLOMITE = 113,
// 	TYPE_SILICATE = 114,
// 	TYPE_RESTLESS = 115,
// 	TYPE_MAGIC_SEWING_MACHINE = 116,
// 	TYPE_MAGIC_WORKSHOP = 117,
// 	TYPE_MAGIC_TABLE = 118,
// 	TYPE_LIST_OF_CRAFTSMEN = 119,
// 	TYPE_PADDOCK = 120,
// 	TYPE_KALIPTUS = 121,
// 	TYPE_SWITCH = 127,
// 	TYPE_CLASS_STATUE = 128,
// 	TYPE__NO_TRAD_ANY_IE = 129,
// 	TYPE_SNOWDROP = 131,
// 	TYPE_ICEFISH = 132,
// 	TYPE_ASPEN = 133,
// 	TYPE_FROSTEEZ = 134,
// 	TYPE_OBSIDIAN = 135,
// 	TYPE_SHELL = 136,
// 	TYPE_POSS_YBEL_S_SEWING_MACHINE = 137,
// 	TYPE_FACTORY = 138,
// 	TYPE_BAD_QUALITY_KITCHEN_TABLE = 139,
// 	TYPE_BAD_QUALITY_WORKSHOP = 140,
// 	TYPE_BAD_QUALITY_WORKBENCH = 141,
// 	TYPE_BAD_QUALITY_SEWING_MACHINE = 142,
// 	TYPE_TOY_MACHINE = 143,
// 	TYPE_FISH_PRESS = 144,
// 	TYPE_WRAPPING_STATION = 145,
// 	TYPE_GIFT_PACKAGE = 146,
// 	TYPE_GIFT_WRAPPING_STATION = 147,
// 	TYPE_ALCHEMISTS__WORKSHOP = 148,
// 	TYPE_JEWELLERS__WORKSHOP = 149,
// 	TYPE_BUTCHERS__WORKSHOP = 150,
// 	TYPE_BUTCHERS__AND_HUNTERS__WORKSHOP = 151,
// 	TYPE_SHIELD_SMITHS__WORKSHOP = 152,
// 	TYPE_BAKERS__WORKSHOP = 153,
// 	TYPE_HANDYMEN_S_WORKSHOP = 154,
// 	TYPE_LUMBERJACKS__WORKSHOP = 155,
// 	TYPE_HUNTERS__WORKSHOP = 156,
// 	TYPE_SHOEMAKERS__WORKSHOP = 157,
// 	TYPE_SMITHMAGI_S_WORKSHOP = 158,
// 	TYPE_SMITHS__WORKSHOP = 159,
// 	TYPE_MINERS__WORKSHOP = 160,
// 	TYPE_FARMERS__WORKSHOP = 161,
// 	TYPE_FISHMONGERS__WORKSHOP = 162,
// 	TYPE_FISHERMEN_AND_FISHMONGERS__WORKSHOP = 163,
// 	TYPE_FISHERMEN_S_WORKSHOP = 164,
// 	TYPE_CARVERS__WORKSHOP = 165,
// 	TYPE_TAILORS__WORKSHOP = 166,
// 	TYPE_ARENA = 167,
// 	TYPE_BANK = 168,
// 	TYPE_BAR_RACUDA = 169,
// 	TYPE_LIBRARY = 170,
// 	TYPE_KWISMAS_SHOPS = 171,
// 	TYPE_DOJO = 172,
// 	TYPE_CHURCH = 173,
// 	TYPE_GROCERY_STORE = 174,
// 	TYPE_SKI_MAKER = 175,
// 	TYPE_TOWN_HALL = 176,
// 	TYPE_PROFESSION_INFORMATION_CENTRE = 177,
// 	TYPE_KANOJEDO = 178,
// 	TYPE_KOLOSSIUM = 179,
// 	TYPE_MILITIA = 180,
// 	TYPE_FRIGOST_S_DOCTOR = 181,
// 	TYPE_INN = 182,
// 	TYPE_ATYU_SIRVIS_S_INN = 183,
// 	TYPE_ATOLMOND_S_INN = 184,
// 	TYPE_THE_SILVER_TAVERN = 185,
// 	TYPE_DJAUL_INN = 186,
// 	TYPE_BAGRUTTE_INN = 187,
// 	TYPE_WOODENGLASS_INN = 188,
// 	TYPE_MISERY_INN = 189,
// 	TYPE_KIKIM_INN = 190,
// 	TYPE_LISA_KAYA_S_TAVERN = 191,
// 	TYPE_SAKAI_TAVERN = 192,
// 	TYPE_BWORK_INN = 193,
// 	TYPE_BURNT_CAT_INN = 194,
// 	TYPE_LAST_CHANCE_SALOON = 195,
// 	TYPE_SWASHBUCKLER_INN = 196,
// 	TYPE_FEUBUK_INN = 197,
// 	TYPE_DRUNKEN_PANDAWA_INN = 198,
// 	TYPE_FRIGOSTIAN_PARADISE_TAVERN = 199,
// 	TYPE_PINCHAUT_INN = 200,
// 	TYPE_RIPATE_INN = 201,
// 	TYPE_GUILD_TEMPLE = 202,
// 	TYPE_TOWER_OF_BRAKMAR = 203,
// 	TYPE_TOWER_OF_ARCHIVES = 204,
// 	TYPE_TOWER_OF_ORDERS = 205,
// 	TYPE_FOGGERNAUT_SUBMARINE = 206,
// 	TYPE_ALTAR = 207,
// 	TYPE_KROSMASTER = 208,
// 	TYPE_GITH_SMOLD_S_WORKSHOP = 209,
// 	TYPE_AL_SHAB_S_WORKSHOP = 210,
// 	TYPE_FRIGOSTINE_S_WORKSHOP = 211,
// 	TYPE_FRANCKY_S_WORKSHOP = 212,
// 	TYPE_DUTCH_S_WORKSHOP = 213,
// 	TYPE_BROKKREITRI_S_WORKSHOP = 214,
// 	TYPE_INGRAM_PART_S_WORKSHOP = 215,
// 	TYPE_CLARISSE_TOCATE_S_WORKSHOP = 216,
// 	TYPE_BEA_FORTAX_S_WORKSHOP = 217,
// 	TYPE_CARLA_GARFIELD_S_WORKSHOP = 218,
// 	TYPE_WEAVER_OF_FORTUNES = 219,
// 	TYPE_BARREL_OF_EXPLOSIVES = 220,
// 	TYPE_SUTOL_FLOWER = 221,
// 	TYPE_BARBECUE = 222,
// 	TYPE_FRESH_CAWWOT = 223,
// 	TYPE_PROFESSION_INFORMATION_CENTRE_S_WEATHERED_ALEMBIC = 224,
// 	TYPE_BOTTLE_OF_RUM = 225,
// 	TYPE_LIFT = 226,
// 	TYPE_MUSHROOM = 227,
// 	TYPE_BOWISSE_S_TABLE = 228,
// 	TYPE_MERIANA_S_WORKSHOP = 229,
// 	TYPE_BWORK_PORTAL = 230,
// 	TYPE_AUTOMATED_TREASURE_MACHINE = 231,
// 	TYPE_PORTAL = 232,
// 	TYPE_GOLDEN_CHEST = 233,
// 	TYPE_ICE_CUBE = 234,
// 	TYPE_GO_TO = 235,
// 	TYPE_DESK = 236,
// 	TYPE_DRAFTING_TABLE = 237,
// 	TYPE_GO_TO_INSTANCE_A = 238,
// 	TYPE_GO_TO_INSTANCE_B = 239,
// 	TYPE_GO_TO_INSTANCE_C = 240,
// 	TYPE_OLD_CHEST_XXIII = 241,
// 	TYPE_CLOCKMAKER_S_WORKBENCH = 242,
// 	TYPE_CHEST_XI = 243,
// 	TYPE_CHEST_XXIII = 244,
// 	TYPE_CHEST_XXXI = 245,
// 	TYPE_CHEST_LIX = 246,
// 	TYPE_CLOCK_THAT_S_2_MINUTES_FAST = 247,
// 	TYPE_CLOCK_THAT_S_3_MINUTES_SLOW = 248,
// 	TYPE_CLOCK_THAT_S_7_MINUTES_FAST = 249,
// 	TYPE_CLOCK_THAT_S_8_MINUTES_SLOW = 250,
// 	TYPE_PAXTIM_EGGS = 251,
// 	TYPE_VOYAGERS__WORKSHOP = 252,
// 	TYPE_ELIOTROPE_PORTAL = 253,
// 	TYPE_NETTLE = 254,
// 	TYPE_SAGE = 255,
// 	TYPE_GINSENG = 256,
// 	TYPE_BELLADONNA = 257,
// 	TYPE_MANDRAKE = 258,
// 	TYPE_HAZEL = 259,
// 	TYPE_CORN = 260,
// 	TYPE_MILLET = 261,
// 	TYPE_STONE_BLOCK = 262,
// 	TYPE_PIKE = 263,
// 	TYPE_KRALOVE = 264,
// 	TYPE_EEL = 265,
// 	TYPE_GREY_SEA_BREAM = 266,
// 	TYPE_PERCH = 267,
// 	TYPE_RAY = 268,
// 	TYPE_MONKFISH = 269,
// 	TYPE_SICKLE_HAMMERHEAD_SHARK = 270,
// 	TYPE_LARD_BASS = 271,
// 	TYPE_COD = 272,
// 	TYPE_TENCH = 273,
// 	TYPE_SWORDFISH = 274,
// 	TYPE_MULIC_BERE_S_ANVIL = 275,
// 	TYPE_MULIC_BERE_S_WORKBENCH = 276,
// 	TYPE_MULIC_BERE_S_WORKSHOP = 277,
// 	TYPE_MULIC_BERE_S_ASSEMBLER = 278,
// 	TYPE_MAGUS_AX_S_WORKSHOP = 279,
// 	TYPE_HUPPERMAGE_PLATFORM = 280,
// 	TYPE_FOUR_LEAF_CLOVER = 281,
// 	TYPE_POINT_OUT_AN_EXIT = 282,
// 	TYPE_CATUNA = 283,
// 	TYPE_STAIRS = 284,
// 	TYPE_REINFORCED_DOOR = 285,
// 	TYPE_UNSPEAKABLE_WORKBENCH = 286,
// 	TYPE_MAHAQUANY = 287,
// 	TYPE_SALIKRONIA = 288,
// 	TYPE_QUISNOA = 289,
// 	TYPE_LIMPET = 290,
// 	TYPE_SEPIOLITE = 291,
// 	TYPE_NATASHA_MANKA_S_WORKSHOP = 298,
// 	TYPE_FRESH_EGGS = 299,
// 	TYPE_HOUSE = 300,
// 	TYPE_TOURNAMENT_ARENA = 301,
// 	TYPE_AQUATIC_MUSHROOM = 302,
// 	TYPE_SOMNITIA_SLEEP_KILLER = 303,
// 	TYPE_GRILLED_SOMNITIA_SLEEP_KILLER = 304,
// 	TYPE_MINIATURE_VILLAGE = 305,
// 	TYPE_ASTRUBIAN_SEWING_MACHINE = 306,
// 	TYPE_GALAETHIEL_S_PINGWIN = 307,
// 	TYPE_SURPRISE_GIFT = 308,
// 	TYPE_CREAKING_BOX = 309,
// 	TYPE_SURPRISE_POTION = 310,
// 	TYPE_MAKESHIFT_WORKSHOP = 311,
// 	TYPE_DOOR_TO_THE_REALM_OF_THE_GODS = 312,
// 	TYPE_RESOURCE_MARKETPLACE = 313,
// 	TYPE_EQUIPMENT_MARKETPLACE = 314,
// 	TYPE_CONSUMABLES_MARKETPLACE = 315,
// 	TYPE_PANNEAU_DIRECTIONNEL = 316,
// 	TYPE_CRYSTAL = 317,
// 	TYPE_RUNE_MARKETPLACE = 318,
// 	TYPE_CREATURE_MARKETPLACE = 319,
// 	TYPE_SOUL_MARKETPLACE = 320,
// 	TYPE_DUNG = 900,
// }
