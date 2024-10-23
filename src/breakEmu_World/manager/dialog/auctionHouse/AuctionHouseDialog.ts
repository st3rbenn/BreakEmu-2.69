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
	ExchangeBidHouseItemAddOkMessage,
	ExchangeBidHouseItemRemoveOkMessage,
	ExchangeBidHouseSearchMessage,
	ExchangeStartedBidBuyerMessage,
	ExchangeStartedBidSellerMessage,
	ExchangeTypesExchangerDescriptionForUserMessage,
	ExchangeTypesItemsExchangerDescriptionForUserMessage,
	ItemTypeEnum,
	NpcActionEnum,
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
	static TAX_PERCENTAGE = 0.2
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

	async open(isSell: boolean = false): Promise<void> {
		try {
			this.character.isAuctionHouseDialog = true
			if (isSell) {
				await this.sendAuctionHouseListForSell()
			} else {
				await this.sendAuctionHouseListForBuy()
			}
		} catch (error) {
			this.logger.error(`Error while opening auction house dialog`)
		}
	}

	async close(): Promise<void> {
		try {
			this.character.removeDialog()
			this.character.isAuctionHouseDialog = false
		} catch (error) {
			this.logger.error("Error while closing auction house dialog")
		}
	}

	private async sendAuctionHouseListForBuy() {
		try {
			await this.character.client.Send(
				new ExchangeStartedBidBuyerMessage(this.getSellerBuyerDescriptor())
			)
		} catch (error) {
			this.logger.error("Error while sending auction house list for buy")
		}
	}

	public async sendAuctionHouseListForSell() {
		try {
			const itemAlreadyOnSale = await this.container
				.get(AuctionHouseItemController)
				.getItemsBySellerId(this.character.accountId)

			const itemsToSell = itemAlreadyOnSale?.map((x) =>
				x.toObjectItemToSellInBid()
			)

			await this.character.client.Send(
				new ExchangeStartedBidSellerMessage(
					this.getSellerBuyerDescriptor(),
					itemsToSell
				)
			)
		} catch (error) {
			this.logger.error("Error while sending auction house list for sell")
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
			this.logger.error("Error while sending bid house type message")
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
					this.typeRecentlyWatched || itemByGids[0].record.typeId,
					message.genId,
					sortedItems || []
				)
			)
		} catch (error) {
			this.logger.error("Error while sending bid house search message")
		}
	}

	async sendBidHouseBuyMessage(
		message: ExchangeBidHouseBuyMessage,
		client: WorldClient
	) {
		const { uid, qty, price } = message

		let bought = false

		const item = this.auctionHouse.getItemByUidAndPrice(uid!, price!)

		try {
			if (item) {
				if (this.character.kamas >= price!) {
					bought = true
					await this.character.inventory.removeKamas(price!)
					await this.character.inventory.addItem(
						item.toCharacterItem(this.character.id),
						qty!,
						this.character.id
					)
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
		} catch (error) {
			this.logger.error("Error while sending bid house buy message")
		}
	}

	private async onBuy(uid: number, bought: boolean) {
		try {
			await this.character.client.Send(
				new ExchangeBidHouseBuyResultMessage(uid, bought)
			)
		} catch (error) {
			this.logger.error("Error while sending bid house buy result message")
		}
	}

	private async onItemBought(item: AuctionHouseItem) {
		const sellerConnected = this.container
			.get(WorldServer)
			.clients.get(item.sellerId)

		try {
			if (sellerConnected) {
				await sellerConnected.selectedCharacter.bank.addKamas(item.price)
				await sellerConnected.selectedCharacter.notifyNewSale(
					item.gId,
					item.quantity,
					item.price
				)
				await this.container
					.get(AuctionHouseItemController)
					.removeItem(item.id, this.auctionHouse)
			} else {
				item.sold = true
				await this.container
					.get(AuctionHouseItemController)
					.modifySoldStatus(item.id, item.price, this.auctionHouse, true)
			}
		} catch (error) {
			this.logger.error("Error while handling item bought")
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
			this.logger.error("Error while sending bid house in list removed message")
		}
	}

	private async onGidRemove() {
		try {
			await this.character.client.Send(
				new ExchangeBidHouseGenericItemRemovedMessage(this.gidRecentlyWatched!)
			)
		} catch (error) {
			this.logger.error(
				"Error while sending bid house generic item removed message"
			)
		}
	}

	public sortItems(items: AuctionHouseItem[]): BidExchangerObjectInfo[] {
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
				}
			}
		}

		return result
	}

	public async sellItem(objectUID: number, price: number, quantity: number) {
		try {
			const itemFromInventory = await this.character.inventory.getItem(
				objectUID
			)

			if (
				itemFromInventory &&
				itemFromInventory.quantity >= quantity &&
				itemFromInventory.canBeExchanged()
			) {
				const cutedItem = await this.character.inventory.cutItem(
					itemFromInventory,
					quantity
				)

				await this.character.inventory.removeItem(itemFromInventory, quantity)

				const auctionItem = await cutedItem.toAuctionHouseItem(
					price,
					this.character.accountId,
					this.auctionHouse.id
				)

				if (auctionItem) {
					await this.onSellItemAdd(auctionItem)
				}
			}
		} catch (error) {
			this.logger.error("Error while selling item")
		}
	}

	public async moveItem(objectUID: number, quantity: number) {
		try {
			const item = this.auctionHouse.getItemByUid(objectUID)

			if (item) {
				const itemAlreadyInInventory = await this.character.inventory.getItemByGid(
					item.gId
				)
				await this.auctionHouse.removeItem(objectUID)

				const characterItem = item.toCharacterItem(this.character.id)

				await this.character.inventory.addItem(
					characterItem,
					quantity,
					this.character.id
				)

				await this.character.client.Send(
					new ExchangeBidHouseItemRemoveOkMessage(objectUID)
				)
			}
		} catch (error) {
			this.logger.error("Error while moving item: ", error as any)
		}
	}

	private async onSellItemAdd(item: AuctionHouseItem) {
		this.auctionHouse.addItem(item)
		try {
			await this.character.client.Send(
				new ExchangeBidHouseItemAddOkMessage(item.toObjectItemToSellInBid())
			)
		} catch (error) {
			this.logger.error("Error while adding item to sell")
		}
	}

	public async onNpcAction(
		character: Character,
		actionId: number
	): Promise<void> {
		console.log("actionId", actionId)
		try {
			if (
				actionId === NpcActionEnum.SELL12 ||
				actionId === NpcActionEnum.SELL5
			) {
				return await this.open(true)
			} else if (
				actionId === NpcActionEnum.BUY6 ||
				actionId === NpcActionEnum.BUY11
			) {
				return await this.open()
			}
		} catch (error) {
			this.logger.error("Error while handling npc action for auction house")
		}
	}

	private buildPrices(item: AuctionHouseItem, quantityIndex: number): number[] {
		const prices = []

		for (let i = 0; i < quantityIndex; i++) {
			prices.push(0)
		}

		prices.push(item.price)

		return prices
	}

	private getSellerBuyerDescriptor() {
		return new SellerBuyerDescriptor(
			this.auctionHouse.quantities,
			this.auctionHouse.itemsTypes,
			AuctionHouseDialog.TAX_PERCENTAGE * 10,
			0,
			200,
			this.character.level * this.auctionHouse.maxItemPerAccount,
			0,
			50
		)
	}
}

export default AuctionHouseDialog
