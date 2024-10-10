import Logger from "@breakEmu_Core/Logger"
import Dialog from "../Dialog"
import Character from "@breakEmu_API/model/character.model"
import MapElement from "@breakEmu_World/manager/map/element/MapElement"
import {
	BidExchangerObjectInfo,
	ExchangeBidHouseBuyMessage,
	ExchangeBidHouseBuyResultMessage,
	ExchangeBidHouseGenericItemRemovedMessage,
	ExchangeBidHouseInListRemovedMessage,
	ExchangeBidHouseSearchMessage,
	ExchangeStartedBidBuyerMessage,
	ExchangeTypesExchangerDescriptionForUserMessage,
	ExchangeTypesItemsExchangerDescriptionForUserMessage,
	ItemTypeEnum,
	SellerBuyerDescriptor,
	TextInformationTypeEnum,
} from "@breakEmu_Protocol/IO"
import AuctionHouse from "@breakEmu_API/model/auctionHouse.model"
import AuctionHouseItem from "@breakEmu_API/model/auctionHouseItem.model"
import WorldClient from "@breakEmu_World/WorldClient"
import ItemCollection from "@breakEmu_World/manager/items/collections/ItemCollections"
import WorldServer from "@breakEmu_World/WorldServer"
import ansiColorCodes from "@breakEmu_Core/Colors"
import AuctionHouseItemController from "@breakEmu_API/controller/auctionHouseItem.controller"

class AuctionHouseDialog extends Dialog {
	logger: Logger = new Logger("AuctionHouseDialog")

	element: MapElement
	auctionHouse: AuctionHouse

	typeRecentlyWatched: ItemTypeEnum | undefined
	gidRecentlyWatched: number | undefined

	constructor(character: Character, element: MapElement) {
		super()
		this.character = character
		this.element = element

		const ah = AuctionHouse.auctionHouses.get(
			parseInt(element.record.skill!.param1 as string)
		)

		if (ah) {
			this.auctionHouse = ah
		}
	}

	async open(): Promise<void> {
		try {
			this.character.isAuctionHouseDialog = true
			await this.sendAuctionHouseList()
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	async close(): Promise<void> {
		try {
			this.character.removeDialog()
			this.character.isAuctionHouseDialog = false
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	private async sendAuctionHouseList() {
		try {
			await this.character.client.Send(
				new ExchangeStartedBidBuyerMessage(
					new SellerBuyerDescriptor(
						this.auctionHouse.quantities,
						this.auctionHouse.itemsTypes,
						0,
						0,
						200,
						this.auctionHouse.maxItemPerAccount,
						0,
						50
					)
				)
			)
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	async sendBidHouseTypeMessage(type: ItemTypeEnum, client: WorldClient) {
		try {
			const itemsGids = this.auctionHouse.getItemGidsByType(type)

			await client.Send(
				new ExchangeTypesExchangerDescriptionForUserMessage(type, [
					...new Set(itemsGids),
				])
			)
			this.typeRecentlyWatched = type
			this.gidRecentlyWatched = undefined
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	async sendBidHouseSearchMessage(
		message: ExchangeBidHouseSearchMessage,
		client: WorldClient
	) {
		try {
			this.gidRecentlyWatched = message.genId
			const itemByGids = this.auctionHouse.getItemsByGid(
				message.genId as number
			)

			const sortedItems = this.sortItems(itemByGids)

			await client.Send(
				new ExchangeTypesItemsExchangerDescriptionForUserMessage(
					this.typeRecentlyWatched as ItemTypeEnum,
					message.genId,
					sortedItems
				)
			)
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	async sendBidHouseBuyMessage(
		message: ExchangeBidHouseBuyMessage,
		client: WorldClient
	) {
		const { uid, qty, price } = message

		let bought = false

		const item = this.auctionHouse.getItemByUidAndPrice(uid!, price!)

		if (item) {
			if (this.character.kamas >= price!) {
				bought = true
				await this.character.inventory.removeKamas(price!)
				await this.onItemBought(item)
				await this.onItemRemove(uid!)
			} else {
				await this.character.textInformation(
					TextInformationTypeEnum.TEXT_INFORMATION_ERROR,
					82,
					[]
				)
			}
		} else {
			await this.character.textInformation(
				TextInformationTypeEnum.TEXT_INFORMATION_MESSAGE,
				64,
				[]
			)

			await this.onItemRemove(uid!)
		}

    await this.onBuy(uid!, bought)
	}

	private async onBuy(uid: number, bought: boolean) {
		try {
			await this.character.client.Send(
				new ExchangeBidHouseBuyResultMessage(uid, bought)
			)
		} catch (error) {
			console.log(error)
		}
	}

	private async onItemBought(item: AuctionHouseItem) {
		const sellerConnected = this.container
			.get(WorldServer)
			.clients.get(item.sellerId)

		if (sellerConnected) {
			await sellerConnected.selectedCharacter.bank.addKamas(item.price)
			await sellerConnected.selectedCharacter.notifyNewSale(
				item.gId,
				item.quantity,
				item.price
			)
			await this.container
				.get(AuctionHouseItemController)
				.removeItem(item.id, this.auctionHouse.id)
		} else {
			item.sold = true
			await this.container
				.get(AuctionHouseItemController)
				.modifySoldStatus(item.id, item.price, this.auctionHouse.id, true)
		}
	}

	private async onItemRemove(uid: number) {
		try {
			await this.character.client.Send(
				new ExchangeBidHouseInListRemovedMessage(
					uid,
					this.gidRecentlyWatched,
					this.typeRecentlyWatched as ItemTypeEnum
				)
			)

			if (
				this.auctionHouse.getItemsByGid(this.gidRecentlyWatched!).length === 0
			) {
				await this.onGidRemove()
			}
		} catch (error) {
			console.log(error)
		}
	}

	private async onGidRemove() {
		try {
			await this.character.client.Send(
				new ExchangeBidHouseGenericItemRemovedMessage(this.gidRecentlyWatched!)
			)
		} catch (error) {
			console.log(error)
		}
	}

	private sortItems(items: AuctionHouseItem[]): BidExchangerObjectInfo[] {
		const result: BidExchangerObjectInfo[] = []

		for (const itemsD of ItemCollection.sortItemsByEffects(items)) {
			for (let i = 0; i < this.auctionHouse.quantities.length; i++) {
				const item = itemsD
					.filter((x) => x.quantity === this.auctionHouse.quantities[i])
					.sort((a, b) => a.price - b.price)

				if (item[0]) {
					result.push(
						item[0].toBidExchangerObjectInfo(this.buildPrices(item[0], i))
					)
				} else {
					console.log("Item not found")
				}
			}
		}

		return result
	}

	private buildPrices(item: AuctionHouseItem, quantityIndex: number): number[] {
		const prices = []

		for (let i = 0; i < quantityIndex; i++) {
			prices.push(0)
		}

		prices.push(item.price)

		return prices
	}
}

export default AuctionHouseDialog