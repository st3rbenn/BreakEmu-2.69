import {
	ItemTypeEnum,
	ObjectEffect,
	ObjectItemToSellInNpcShop,
} from "../../breakEmu_Server/IO"
import EffectCollection from "../../breakEmu_World/manager/entities/effect/EffectCollection"
import ItemSet from "./itemSet.model"

class Item {
  private MINIMUM_ITEM_PRICE = 1

	private _id: number
	private _name: string
	private _typeId: number
	private _level: number
	private _realWeight: number
	private _cursed: boolean
	private _usable: boolean
	private _exchangeable: boolean
	private _price: number
	private _etheral: boolean
	private _itemSetid: number
	private _criteria: string
	private _appearanceId: number
	private _dropMonsterIds: number[]
	private _recipeSlots: number
	private _recipeIds: number[]
	private _effects: EffectCollection
	private _craftXpRatio: number
	private _isSaleable: boolean

  //ItemSet
  private _itemSet: any | null = null

	public static items: Map<number, Item> = new Map<number, Item>()

	constructor(
		id: number,
		name: string,
		typeId: number,
		level: number,
		realWeight: number,
		cursed: boolean,
		usable: boolean,
		exchangeable: boolean,
		price: number,
		etheral: boolean,
		itemSetId: number,
		criteria: string,
		appearanceId: number,
		dropMonsterIds: number[],
		recipeSlots: number,
		recipeIds: number[],
		effects: EffectCollection,
		craftXpRatio: number,
		isSaleable: boolean
	) {
		this._id = id
		this._name = name
		this._typeId = typeId
		this._level = level
		this._realWeight = realWeight
		this._cursed = cursed
		this._usable = usable
		this._exchangeable = exchangeable
		this._price = price
		this._etheral = etheral
		this._itemSetid = itemSetId
		this._criteria = criteria
		this._appearanceId = appearanceId
		this._dropMonsterIds = dropMonsterIds
		this._recipeSlots = recipeSlots
		this._recipeIds = recipeIds
		this._effects = effects
		this._craftXpRatio = craftXpRatio
		this._isSaleable = isSaleable
	}

  public init() {
    for(const item of Item.items.values()) {
      if(item.hasSet) {
        item.itemSet = ItemSet.getItemSet(item.itemSetid)
      }

      if(item.price < this.MINIMUM_ITEM_PRICE) {
        item.price = this.MINIMUM_ITEM_PRICE
      }
    }
  }

	public get typeEnum() {
		return ItemTypeEnum[this._typeId]
	}

	public isCeremonialItem(): boolean {
		return (
			this.typeId == ItemTypeEnum.CEREMONIAL_CAPE ||
			this.typeId == ItemTypeEnum.CEREMONIAL_HAT ||
			this.typeId == ItemTypeEnum.CEREMONIAL_PET ||
			this.typeId == ItemTypeEnum.CEREMONIAL_PETSMOUNT ||
			this.typeId == ItemTypeEnum.CEREMONIAL_SHIELD ||
			this.typeId == ItemTypeEnum.CEREMONIAL_PETSMOUNT ||
			this.typeId == ItemTypeEnum.CEREMONIAL_WEAPON ||
			this.typeId == ItemTypeEnum.MISCELLANEOUS_CEREMONIAL_ITEM
		)
	}

	public getObjectItemToSellInNpcShop(): ObjectItemToSellInNpcShop {
		let effects: ObjectEffect[] = []

		this.effects.effects.forEach((effect) => {
			effects.push(effect.getObjectEffect())
		})
		return new ObjectItemToSellInNpcShop(this.id, effects, this.price, "")
	}

	public static getItem(id: number): Item {
		return this.items.get(id) as Item
	}

  public static addItem(item: Item): void {
    this.items.set(item.id, item)
  }

	public get hasSet() {
		return this.itemSetid != -1
	}

  public get itemSet() {
    if(this._itemSet === null) {
      this._itemSet = ItemSet.getItemSet(this.itemSetid)
    }

    return this._itemSet
  }

  public set itemSet(itemSet: ItemSet) {
    this._itemSet = itemSet
  }

	public get id(): number {
		return this._id
	}

	public set id(id: number) {
		this._id = id
	}

	public get name(): string {
		return this._name
	}

	public set name(name: string) {
		this._name = name
	}

	public get typeId(): number {
		return this._typeId
	}

	public set typeId(typeId: number) {
		this._typeId = typeId
	}

	public get level(): number {
		return this._level
	}

	public set level(level: number) {
		this._level = level
	}

	public get realWeight(): number {
		return this._realWeight
	}

	public set realWeight(realWeight: number) {
		this._realWeight = realWeight
	}

	public get cursed(): boolean {
		return this._cursed
	}

	public set cursed(cursed: boolean) {
		this._cursed = cursed
	}

	public get usable(): boolean {
		return this._usable
	}

	public set usable(usable: boolean) {
		this._usable = usable
	}

	public get exchangeable(): boolean {
		return this._exchangeable
	}

	public set exchangeable(exchangeable: boolean) {
		this._exchangeable = exchangeable
	}

	public get price(): number {
		return this._price
	}

	public set price(price: number) {
		this._price = price
	}

	public get etheral(): boolean {
		return this._etheral
	}

	public set etheral(etheral: boolean) {
		this._etheral = etheral
	}

	public get itemSetid(): number {
		return this._itemSetid
	}

	public set itemSetid(itemSetid: number) {
		this._itemSetid = itemSetid
	}

	public get criteria(): string {
		return this._criteria
	}

	public set criteria(criteria: string) {
		this._criteria = criteria
	}

	public get appearanceId(): number {
		return this._appearanceId
	}

	public set appearanceId(appearanceId: number) {
		this._appearanceId = appearanceId
	}

	public get dropMonsterIds(): number[] {
		return this._dropMonsterIds
	}

	public set dropMonsterIds(dropMonsterIds: number[]) {
		this._dropMonsterIds = dropMonsterIds
	}

	public get recipeSlots(): number {
		return this._recipeSlots
	}

	public set recipeSlots(recipeSlots: number) {
		this._recipeSlots = recipeSlots
	}

	public get recipeIds(): number[] {
		return this._recipeIds
	}

	public set recipeIds(recipeIds: number[]) {
		this._recipeIds = recipeIds
	}

	public get effects(): EffectCollection {
		return this._effects
	}

	public set effects(effects: EffectCollection) {
		this._effects = effects
	}

	public get craftXpRatio(): number {
		return this._craftXpRatio
	}

	public set craftXpRatio(craftXpRatio: number) {
		this._craftXpRatio = craftXpRatio
	}

	public get isSaleable(): boolean {
		return this._isSaleable
	}

	public set isSaleable(isSaleable: boolean) {
		this._isSaleable = isSaleable
	}
}

export default Item
