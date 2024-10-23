import { ItemTypeEnum } from "@breakEmu_Protocol/IO"
import AuctionHouseItem from "./auctionHouseItem.model"
import ItemCollection from "@breakEmu_World/manager/items/collections/ItemCollections"
import AuctionHouseItemController from "@breakEmu_API/controller/auctionHouseItem.controller"
import Container from "@breakEmu_Core/container/Container"

class AuctionHouse {
	static auctionHouses: Map<number, AuctionHouse> = new Map()
	static averagePrices: Map<number, number> = new Map()
	private container: Container = Container.getInstance()
	id: number
	quantities: number[] = []
	itemsTypes: number[] = []
	maxItemPerAccount: number = 2

	items: Map<number, AuctionHouseItem> = new Map()

	constructor(
		id: number,
		quantities: number[],
		itemsTypes: number[],
		maxItemPerAccount: number
	) {
		this.id = id
		this.quantities = quantities
		this.itemsTypes = itemsTypes
	}

	getItemGidsByType(type: ItemTypeEnum): number[] {
		let gids: number[] = []

		for (const [_, item] of this.items) {
			if (item.record.typeId === type) {
				gids.push(item.gId)
			}
		}

		return gids
	}

	getItemsByGid(gid: number): AuctionHouseItem[] {
		let items: AuctionHouseItem[] = []

		for (const [_, item] of this.items) {
			if (item.gId === gid) {
				items.push(item)
			}
		}

		return items
	}

	getItemByGid(gid: number): AuctionHouseItem | undefined {
		for (const [_, item] of this.items) {
			if (item.gId === gid) {
				return item
			}
		}

		return undefined
	}

	getItemByUid(uid: number): AuctionHouseItem | undefined {
		return this.items.get(uid)
	}

	getItemByUidAndPrice(
		uid: number,
		price: number
	): AuctionHouseItem | undefined {
		for (const [_, item] of this.items) {
			if (item.id === uid && item.price === price) {
				return item
			}
		}

		return undefined
	}

	addItem(item: AuctionHouseItem) {
		this.items.set(item.id, item)
	}

	async modifyItemPrice(uid: number, price: number) {
		const item = this.items.get(uid)
		if (item) {
			item.price = price

			await this.container.get(AuctionHouseItemController).updateItemPrice(item)
		}
	}

	public async removeItem(itemUid: number) {
		try {
			await this.container
				.get(AuctionHouseItemController)
				.removeItem(itemUid, this)

			this.items.delete(itemUid)
		} catch (error) {
			console.error(error)
		}
	}

	//TODO: test this method to refresh average prices of every auction house
	static refreshAveragePrices() {
		this.averagePrices.clear()
		for (const [_, auctionHouse] of this.auctionHouses) {
			const prices: Map<number, number[]> = new Map()
			for (const item of Array.from(auctionHouse.items.values()).filter(
				(x) => x.quantity === 1
			)) {
				if (!prices.has(item.gId)) {
					prices.set(item.gId, [])
				}

				prices.get(item.gId)?.push(item.price)
			}

			for (const [gId, priceList] of prices) {
				this.averagePrices.set(gId, this.getAveragePrice(priceList))
			}
		}
	}

	static getAveragePriceByGid(gid: number): number {
		return this.averagePrices.get(gid) as number
	}

	getOneOfEachQuantityPrices(gid: number): number[] {
		//for 1 quantity, 10 quantity, 100 quantity
		//grab only the lowest price of each quantity
		let prices: number[] = []
		for (const quantity of this.quantities) {
			let lowestPrice = Number.MAX_SAFE_INTEGER
			for (const [_, item] of this.items) {
				if (
					item.gId === gid &&
					item.quantity === quantity &&
					item.price < lowestPrice
				) {
					lowestPrice = item.price
				}
			}
			if (lowestPrice === Number.MAX_SAFE_INTEGER) {
				continue
			} else {
				prices.push(lowestPrice)
			}
		}

		return prices
	}

	static getAveragePrice(priceList: number[]): number {
		const total = priceList.reduce(
			(accumulator, currentPrice) => accumulator + currentPrice,
			0
		)
		const average = total / priceList.length
		return parseInt(average.toFixed(2))
	}
}

export default AuctionHouse
