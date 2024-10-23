import { InteractiveTypeEnum } from "@breakEmu_Protocol/IO"
import IInteractiveElementHandler from "./IInteractiveElementHandler"
import GatherElementHandler from "./GatherElementHandler"
import ZaapHandler from "./ZaapHandler"
import BankHandler from "./BankHandler"
import CraftHandler from "./CraftHandler"
import AuctionHouseHandler from "./AuctionHouseHandler"
import Singleton from "@breakEmu_Core/decorator/singleton.decorator"

@Singleton
class HandlerRegistry {
	private handlers: Partial<
		Record<InteractiveTypeEnum, IInteractiveElementHandler>
	> = {}

	gatherHandler = new GatherElementHandler()
	zaapHandler = new ZaapHandler()
	bankHandler = new BankHandler()
	craftHandler = new CraftHandler()

	auctionHouseHandler = new AuctionHouseHandler()

	constructor() {
		this.registerHandlers()
	}

	private registerHandlers() {
		this.gatherRegisterHandler()
		this.zaapRegisterHandler()
		this.craftRegisterHandler()
		this.auctionHouseRegisterHandler()
	}

	private gatherRegisterHandler() {
		this.handlers[InteractiveTypeEnum.TYPE_ASH] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_WALNUT] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_MAPLE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_CHESTNUT] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_CHERRY] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_OAK] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_BAMBOO] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_DARK_BAMBOO] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_HOLY_BAMBOO] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_YEW] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_HORNBEAM] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_HAZEL] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_ELM] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_OLIVIOLET] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_ASPEN] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_EBONY] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_KALIPTUS] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_AQUAJOU] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_PINE] = this.gatherHandler

		//cereal
		this.handlers[InteractiveTypeEnum.TYPE_WHEAT] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_BARLEY] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_FLAX] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_OATS] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_RYE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_HOP] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_RICE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_MALT] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_HEMP] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_CORN] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_MILLET] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_FROSTEEZ] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_QUISNOA] = this.gatherHandler

		//ore
		this.handlers[InteractiveTypeEnum.TYPE_IRON] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_COPPER] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_BRONZE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_SILVER] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_GOLD] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_TIN] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_BAUXITE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_COBALT] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_MANGANESE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_SILICATE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_DOLOMITE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_OBSIDIAN] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_SEAFOAM] = this.gatherHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_LIQUID_CRYSTAL_ORE
		] = this.gatherHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_FOLDING_CRYSTAL_ORE
		] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_STONEASH] = this.gatherHandler

		//flower
		this.handlers[InteractiveTypeEnum.TYPE_NETTLE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_SAGE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_EDELWEISS] = this.gatherHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_FIVE_LEAF_CLOVER
		] = this.gatherHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_FREYESQUE_ORCHID
		] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_WILD_MINT] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_GINSENG] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_MANDRAKE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_PANDKIN] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_SNOWDROP] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_BELLADONNA] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_SALIKORN] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_TULIP_PAPER] = this.gatherHandler

		//fish
		this.handlers[InteractiveTypeEnum.TYPE_GUDGEON] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_TROUT] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_CRAB] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_KITTENFISH] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_BREADED_FISH] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_EDIEM_CARP] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_SHINY_SARDINE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_PIKE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_KRALOVE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_EEL] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_GREY_SEA_BREAM] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_PERCH] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_RAY] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_MONKFISH] = this.gatherHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_SICKLE_HAMMERHEAD_SHARK
		] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_LARD_BASS] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_COD] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_TENCH] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_SWORDFISH] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_ICEFISH] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_PATELLE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_INK_PICHON] = this.gatherHandler
    this.handlers[InteractiveTypeEnum.TYPE_GRAWN] = this.gatherHandler
	}

	private zaapRegisterHandler() {
		this.handlers[InteractiveTypeEnum.TYPE_ZAAP] = this.zaapHandler
		this.handlers[InteractiveTypeEnum.TYPE_ZAAPI] = this.zaapHandler
		this.handlers[InteractiveTypeEnum.TYPE_BANK] = this.bankHandler
	}

	private craftRegisterHandler() {
		this.handlers[InteractiveTypeEnum.TYPE_CRUSHER] = this.craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_OVEN] = this.craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_CRAFTING_TABLE] = this.craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_WORKSHOP] = this.craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_ANVIL] = this.craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_GRIND] = this.craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_MOULD] = this.craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_BENCH] = this.craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_SAW] = this.craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_SEWING_MACHINE] = this.craftHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_HANDYMEN_S_WORKSHOP
		] = this.craftHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_HUNTERS__WORKSHOP
		] = this.craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_BREWING_STAND] = this.craftHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_JEWELLERS__WORKSHOP
		] = this.craftHandler
	}

	private auctionHouseRegisterHandler() {
		this.handlers[
			InteractiveTypeEnum.TYPE_RESOURCE_MARKETPLACE
		] = this.auctionHouseHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_EQUIPMENT_MARKETPLACE
		] = this.auctionHouseHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_CONSUMABLES_MARKETPLACE
		] = this.auctionHouseHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_RUNE_MARKETPLACE
		] = this.auctionHouseHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_CREATURE_MARKETPLACE
		] = this.auctionHouseHandler
		this.handlers[
			InteractiveTypeEnum.TYPE_SOUL_MARKETPLACE
		] = this.auctionHouseHandler
	}

	public getHandler(
		type: InteractiveTypeEnum
	): IInteractiveElementHandler | undefined {
		return this.handlers[type]
	}
}

export default HandlerRegistry
