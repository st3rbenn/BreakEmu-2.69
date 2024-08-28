import {
	CharacterInventoryPositionEnum,
	ObjectItem,
	ObjectItemQuantity,
} from "@breakEmu_Protocol/IO"
import EffectCollection from "../entities/effect/EffectCollection"
import Item from "@breakEmu_API/model/item.model"
import CharacterItem from "@breakEmu_API/model/characterItem.model"

abstract class AbstractItem {
	uId: string
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
		uId: string,
		gId: number,
		position: number,
		quantity: number,
		effects: EffectCollection,
		appearanceId: number,
		look: string
	) {
		this.uId = uId
		this.gId = gId
		this.position = position
		this.quantity = quantity
		this.effects = effects
		this.appearanceId = appearanceId
		this.look = look
	}

	get positionEnum(): CharacterInventoryPositionEnum {
		return this.position as CharacterInventoryPositionEnum
	}

	set positionEnum(value: CharacterInventoryPositionEnum) {
		this.position = value as number
	}

	abstract getObjectItem(): Promise<ObjectItem>
	abstract getObjectItemQuantity(): ObjectItemQuantity
	abstract cloneWithUID(): AbstractItem
	abstract cloneWithoutUID(): AbstractItem
	abstract initialize(): void

	

	// toMerchantItemRecord(/* Paramètres */): MerchantItemRecord {
	//     // Implémentation de la méthode
	//     return new MerchantItemRecord();
	// }

	toCharacterItemRecord(characterId: number): CharacterItem {
		// Implémentation de la méthode
		return new CharacterItem(
			characterId,
			this.uId,
			this.gId,
			this.quantity,
			this.position,
			this.look,
			this.effects,
			this.appearanceId
		)
	}

	// ... Autres méthodes ...
}

export default AbstractItem
