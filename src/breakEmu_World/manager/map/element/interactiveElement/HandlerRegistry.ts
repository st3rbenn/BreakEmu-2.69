import { InteractiveTypeEnum } from "@breakEmu_Protocol/IO"
import IInteractiveElementHandler from "./IInteractiveElementHandler"
import GatherElementHandler from "./GatherElementHandler"
import ZaapHandler from "./ZaapHandler"
import BankHandler from "./BankHandler"
import CraftHandler from "./CraftHandler"

class HandlerRegistry {
	private static instance: HandlerRegistry
	private handlers: Partial<
		Record<InteractiveTypeEnum, IInteractiveElementHandler>
	> = {}

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
		const gatherHandler = new GatherElementHandler()
		const zaapHandler = new ZaapHandler()
		const bankHandler = new BankHandler()
		const craftHandler = new CraftHandler()

		this.handlers[InteractiveTypeEnum.TYPE_WHEAT] = gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_NETTLE] = gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_GUDGEON] = gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_ASH] = gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_IRON] = gatherHandler
		this.handlers[InteractiveTypeEnum.TYPE_GRAWN] = gatherHandler

		this.handlers[InteractiveTypeEnum.TYPE_ZAAP] = zaapHandler
		this.handlers[InteractiveTypeEnum.TYPE_ZAAPI] = zaapHandler
		this.handlers[InteractiveTypeEnum.TYPE_BANK] = bankHandler

		//job craft handler
		this.handlers[InteractiveTypeEnum.TYPE_CRUSHER] = craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_OVEN] = craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_CRAFTING_TABLE] = craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_WORKSHOP] = craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_ANVIL] = craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_GRIND] = craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_MOULD] = craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_BENCH] = craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_SAW] = craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_SEWING_MACHINE] = craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_HANDYMEN_S_WORKSHOP] = craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_HUNTERS__WORKSHOP] = craftHandler
		this.handlers[InteractiveTypeEnum.TYPE_BREWING_STAND] = craftHandler
    this.handlers[InteractiveTypeEnum.TYPE_JEWELLERS__WORKSHOP] = craftHandler
	}

	public getHandler(
		type: InteractiveTypeEnum
	): IInteractiveElementHandler | undefined {
		return this.handlers[type]
	}
}

export default HandlerRegistry
