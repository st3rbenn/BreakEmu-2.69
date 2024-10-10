import { ItemTypeEnum } from "@breakEmu_Protocol/IO"
import AuctionHouseItem from "./auctionHouseItem.model"
import ItemCollection from "@breakEmu_World/manager/items/collections/ItemCollections"

class AuctionHouse {
	static auctionHouses: Map<number, AuctionHouse> = new Map()
	id: number
	quantities: number[]
	itemsTypes: number[]
	maxItemPerAccount: number

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
		this.maxItemPerAccount = maxItemPerAccount
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

  getItemByUid(uid: number): AuctionHouseItem | undefined {
    return this.items.get(uid)
  }

  getItemByUidAndPrice(uid: number, price: number): AuctionHouseItem | undefined {
    for (const [_, item] of this.items) {
      if (item.id === uid && item.price === price) {
        return item
      }
    }

    return undefined
  }
}

export default AuctionHouse
