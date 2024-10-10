import Logger from "@breakEmu_Core/Logger"
import IInteractiveElementHandler from "./IInteractiveElementHandler"
import Character from "@breakEmu_API/model/character.model"
import MapElement from "../MapElement"
import {
	ExchangeBidHouseBuyMessage,
	ExchangeBidHouseSearchMessage,
	ExchangeBidHouseTypeMessage,
	ExchangeStartedBidBuyerMessage,
	SellerBuyerDescriptor,
} from "@breakEmu_Protocol/IO"
import AuctionHouseDialog from "@breakEmu_World/manager/dialog/auctionHouse/AuctionHouseDialog"
import WorldClient from "@breakEmu_World/WorldClient"

class AuctionHouseHandler implements IInteractiveElementHandler {
	static logger: Logger = new Logger("AuctionHouseHandler")
	async handle(character: Character, element: MapElement): Promise<void> {
		try {
			await character.setDialog(new AuctionHouseDialog(character, element))
		} catch (error) {
			AuctionHouseHandler.logger.error(error as string)
		}
	}

	static async exchangeBidHouseTypeMessage(
		character: Character,
		message: ExchangeBidHouseTypeMessage
	) {
		try {
			await (character.dialog as AuctionHouseDialog).sendBidHouseTypeMessage(
				message.type as number,
				character.client
			)
		} catch (error) {
			this.logger.error(error as string)
		}
	}

	static async exchangeBidHouseSearchMessage(
		character: Character,
		message: ExchangeBidHouseSearchMessage
	) {
		try {
			await (character.dialog as AuctionHouseDialog).sendBidHouseSearchMessage(
				message,
				character.client
			)
		} catch (error) {
			this.logger.error(error as string)
		}
	}

	static async exchangeBidHouseBuyMessage(
		character: Character,
		message: ExchangeBidHouseBuyMessage
	) {
		try {
      await (character.dialog as AuctionHouseDialog).sendBidHouseBuyMessage(
        message,
        character.client
      )
		} catch (error) {
			this.logger.error(error as string)
		}
	}
}

export default AuctionHouseHandler
