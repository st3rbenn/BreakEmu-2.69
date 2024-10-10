import { InteractiveTypeEnum } from "@breakEmu_Protocol/IO"
import IInteractiveElementHandler from "./IInteractiveElementHandler"
import GatherElementHandler from "./GatherElementHandler"
import ZaapHandler from "./ZaapHandler"
import BankHandler from "./BankHandler"
import CraftHandler from "./CraftHandler"
import AuctionHouseHandler from "./AuctionHouseHandler"

class HandlerRegistry {
	private static instance: HandlerRegistry
	private handlers: Partial<
		Record<InteractiveTypeEnum, IInteractiveElementHandler>
	> = {}

	gatherHandler = new GatherElementHandler()
	zaapHandler = new ZaapHandler()
	bankHandler = new BankHandler()
	craftHandler = new CraftHandler()

	auctionHouseHandler = new AuctionHouseHandler()

	private constructor() {
		this.registerHandlers()
	}

	public static getInstance(): HandlerRegistry {
		if (!HandlerRegistry.instance) {
			HandlerRegistry.instance = new HandlerRegistry()
		}
		return HandlerRegistry.instance
	}

	private registerHandlers() {
		this.handlers[InteractiveTypeEnum.TYPE_WELL] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_WHEAT] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_NETTLE] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_GUDGEON] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_ASH] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_IRON] = this.gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_GRAWN] = this.gatherHandler

		this.handlers[InteractiveTypeEnum.TYPE_ZAAP] = this.zaapHandler
		this.handlers[InteractiveTypeEnum.TYPE_ZAAPI] = this.zaapHandler
		this.handlers[InteractiveTypeEnum.TYPE_BANK] = this.bankHandler

		this.handlers[
			InteractiveTypeEnum.TYPE_RESOURCE_MARKETPLACE
		] = this.auctionHouseHandler

		//job craft handler
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

	public getHandler(
		type: InteractiveTypeEnum
	): IInteractiveElementHandler | undefined {
		return this.handlers[type]
	}
}

export default HandlerRegistry
