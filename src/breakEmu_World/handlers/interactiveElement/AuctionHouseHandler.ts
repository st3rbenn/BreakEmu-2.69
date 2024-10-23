import Character from "@breakEmu_API/model/character.model"
import Logger from "@breakEmu_Core/Logger"
import {
	ExchangeBidHouseBuyMessage,
	ExchangeBidHouseItemAddOkMessage,
	ExchangeBidHousePriceMessage,
	ExchangeBidHouseSearchMessage,
	ExchangeBidHouseTypeMessage,
	ExchangeBidPriceForSellerMessage,
	ExchangeBidPriceMessage,
	ExchangeObjectModifyPricedMessage,
	ExchangeObjectMovePricedMessage,
	ExchangeSellOkMessage,
	ExchangeTypesItemsExchangerDescriptionForUserMessage,
	ItemTypeEnum,
	ObjectAveragePricesMessage,
} from "@breakEmu_Protocol/IO"
import AuctionHouseDialog from "@breakEmu_World/manager/dialog/auctionHouse/AuctionHouseDialog"
import MapElement from "../../manager/map/element/MapElement"
import IInteractiveElementHandler from "./IInteractiveElementHandler"
import AuctionHouse from "@breakEmu_API/model/auctionHouse.model"
import WorldClient from "@breakEmu_World/WorldClient"
import AuctionHouseItem from "@breakEmu_API/model/auctionHouseItem.model"

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

	static async handleExchangeBidHousePriceMessage(
		client: WorldClient,
		message: ExchangeBidHousePriceMessage
	) {
		const { genId } = message

		const averagePrice = AuctionHouse.getAveragePriceByGid(genId!)

		try {
			if (averagePrice) {
				const test = this.buildMinimalPrices(genId!, client.selectedCharacter)

				await client.Send(
					new ExchangeBidPriceForSellerMessage(genId, averagePrice, false, test)
				)
			}
		} catch (error) {
			this.logger.error("Error while sending ExchangeBidPriceForSellerMessage")
		}
	}

	static async handleExchangeObjectMovePricedMessage(
		client: WorldClient,
		message: ExchangeObjectMovePricedMessage
	) {
		const { objectUID, price, quantity } = message

		try {
			await (client.selectedCharacter.dialog as AuctionHouseDialog).sellItem(
				objectUID!,
				price!,
				quantity!
			)
		} catch (error) {
			this.logger.error("Error while selling item")
		}
	}

	static async handleExchangeObjectModifyPricedMessage(
		client: WorldClient,
		message: ExchangeObjectModifyPricedMessage
	) {
		const { objectUID, price } = message

		try {
			const auctionHouse = (client.selectedCharacter
				.dialog as AuctionHouseDialog).auctionHouse
			const item = auctionHouse.getItemByUid(objectUID!)

			if (item) {
				await auctionHouse.modifyItemPrice(item.id, price!)

				await (client.selectedCharacter
					.dialog as AuctionHouseDialog).sendAuctionHouseListForSell()
			}
		} catch (error) {
			this.logger.error("Error while modifying item price")
		}
	}

	private static buildMinimalPrices(
		itemGid: number,
		character: Character
	): number[] {
		return (character.dialog as AuctionHouseDialog).auctionHouse.getOneOfEachQuantityPrices(
			itemGid
		)
	}
}

export default AuctionHouseHandler
