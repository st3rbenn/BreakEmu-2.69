import EffectCollection from "@breakEmu_World/manager/entities/effect/EffectCollection"
import Item from "./item.model"
import { BidExchangerObjectInfo, ItemTypeEnum, ObjectItem, ObjectItemNotInContainer, ObjectItemQuantity, ObjectItemToSellInBid } from "@breakEmu_Protocol/IO"
import AbstractItem from "@breakEmu_World/manager/items/AbstractItem"
import CharacterItem from "./characterItem.model"

class AuctionHouseItem extends AbstractItem {
	auctionHouseId: number
	sellerId: number
  price: number
  sold: boolean

	constructor(
		uid: number,
		gid: number,
		price: number,
		position: number,
		quantity: number,
		effects: EffectCollection,
		appearanceId: number,
		look: string,
		auctionHouseId: number,
		sellerId: number,
    sold: boolean
	) {
    super(
      gid,
      position,
      quantity,
      effects,
      appearanceId,
      look,
      uid
    )
		this.auctionHouseId = auctionHouseId
		this.sellerId = sellerId
    this.price = price
    this.sold = sold
	}


  toBidExchangerObjectInfo(prices: number[]) {
    return new BidExchangerObjectInfo(
      this.id,
      this.gId,
      ItemTypeEnum[this.record.typeEnum as keyof typeof ItemTypeEnum],
      this.effects.getObjectEffects(),
      prices
    )
  }

  toCharacterItem(charactrerId: number) {
    return new CharacterItem(
      charactrerId,
      this.gId,
      this.quantity,
      this.position,
      this.look,
      this.effects,
      this.appearanceId
    )
  }

  toObjectItemToSellInBid() {
    return new ObjectItemToSellInBid(
      this.gId,
      this.effects.getObjectEffects(),
      this.id,
      this.quantity,
      this.price,
      0
    )
  }


  getObjectItem(): ObjectItem {
    throw new Error("Method not implemented.")
  }
  getObjectItemQuantity(): ObjectItemQuantity {
    throw new Error("Method not implemented.")
  }
  getObjectItemNotInContainer(): ObjectItemNotInContainer {
    throw new Error("Method not implemented.")
  }
  cloneWithUID(): AbstractItem {
    throw new Error("Method not implemented.")
  }
  cloneWithoutUID(): AbstractItem {
    throw new Error("Method not implemented.")
  }
  initialize(): void {
    throw new Error("Method not implemented.")
  }
}

export default AuctionHouseItem
