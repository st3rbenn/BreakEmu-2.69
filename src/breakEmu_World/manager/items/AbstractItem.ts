import {
	CharacterInventoryPositionEnum,
	ObjectItem,
	ObjectItemQuantity,
} from "../../../breakEmu_Server/IO"
import EffectCollection from "../entities/effect/EffectCollection"
import Item from "../../../breakEmu_API/model/item.model"
import CharacterItem from "../../../breakEmu_API/model/characterItem.model"

abstract class AbstractItem {
	private _uId: string
	private _gId: number
	private _position: number
	private _quantity: number
	private _effects: EffectCollection
	private _appearanceId: number
	private _look: string

	private m_record: Item | null = null

	get record(): Item {
		if (this.m_record === null) {
			this.m_record = Item.getItem(this._gId)
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
		this._uId = uId
		this._gId = gId
		this._position = position
		this._quantity = quantity
		this._effects = effects
		this._appearanceId = appearanceId
		this._look = look
	}

	get positionEnum(): CharacterInventoryPositionEnum {
		return this._position as CharacterInventoryPositionEnum
	}

	set positionEnum(value: CharacterInventoryPositionEnum) {
		this._position = value as number
	}

	abstract getObjectItem(): Promise<ObjectItem>
	abstract getObjectItemQuantity(): ObjectItemQuantity
	abstract cloneWithUID(): AbstractItem
	abstract cloneWithoutUID(): AbstractItem
	abstract initialize(): void

	public get uId(): string {
		return this._uId
	}

	public set uId(uId: string) {
		this._uId = uId
	}

	public get gId(): number {
		return this._gId
	}

	public set gId(gId: number) {
		this._gId = gId
	}

	public get position(): number {
		return this._position
	}

	public set position(position: number) {
		this._position = position
	}

	public get quantity(): number {
		return this._quantity
	}

	public set quantity(quantity: number) {
		this._quantity = quantity
	}

	public get effects(): EffectCollection {
		return this._effects
	}

	public set effects(effects: EffectCollection) {
		this._effects = effects
	}

	public get appearanceId(): number {
		return this._appearanceId
	}

	public set appearanceId(appearanceId: number) {
		this._appearanceId = appearanceId
	}

	public get look(): string {
		return this._look
	}

	public set look(look: string) {
		this._look = look
	}

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
