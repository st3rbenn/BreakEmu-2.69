import {
	CharacterInventoryPositionEnum,
	ObjectItem,
	ObjectItemNotInContainer,
	ObjectItemQuantity,
} from "@breakEmu_Protocol/IO"
import EffectCollection from "../entities/effect/EffectCollection"
import Item from "@breakEmu_API/model/item.model"
import CharacterItem from "@breakEmu_API/model/characterItem.model"

abstract class AbstractItem {
	id: number
	gId: number
	position: number
	quantity: number
	effects: EffectCollection
	appearanceId: number
	look: string

	private m_record: Item | null = null

	get record(): Item {
		if (this.m_record === null) {
			this.m_record = Item.getItem(this.gId)
			return this.m_record
		} else {
			return this.m_record
		}
	}

	constructor(
		gId: number,
		position: number,
		quantity: number,
		effects: EffectCollection,
		appearanceId: number,
		look: string,
    id?: number
	) {
		this.gId = gId
		this.position = position
		this.quantity = quantity
		this.effects = effects
		this.appearanceId = appearanceId
		this.look = look
    if (id) {
      this.id = id
    } else {
      this.id = 0
    }
	}

	get positionEnum(): CharacterInventoryPositionEnum {
		return this.position as CharacterInventoryPositionEnum
	}

	set positionEnum(value: CharacterInventoryPositionEnum) {
		this.position = value as number
	}

	abstract getObjectItem(): ObjectItem
	abstract getObjectItemQuantity(): ObjectItemQuantity
  abstract getObjectItemNotInContainer(): ObjectItemNotInContainer
	abstract cloneWithUID(): AbstractItem
	abstract cloneWithoutUID(): AbstractItem
	abstract initialize(): void

	

	// toMerchantItemRecord(/* Paramètres */): MerchantItemRecord {
	//     // Implémentation de la méthode
	//     return new MerchantItemRecord();
	// }

	// ... Autres méthodes ...
}

export default AbstractItem
