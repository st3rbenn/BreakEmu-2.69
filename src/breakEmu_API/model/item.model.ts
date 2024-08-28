import {
	ItemTypeEnum,
	ObjectEffect,
	ObjectItemToSellInNpcShop,
} from "@breakEmu_Protocol/IO"
import EffectCollection from "@breakEmu_World/manager/entities/effect/EffectCollection"
import Character from "./character.model"
import CharacterItem from "./characterItem.model"
import ItemSet from "./itemSet.model"

class Item {
	MINIMUM_ITEM_PRICE = 1

	id: number
	name: string
	typeId: number
	level: number
	realWeight: number
	cursed: boolean
	usable: boolean
	exchangeable: boolean
	price: number
	etheral: boolean
	itemSetid: number
	criteria: string
	appearanceId: number
	dropMonsterIds: number[]
	recipeSlots: number
	recipeIds: number[]
	effects: EffectCollection
	craftXpRatio: number
	isSaleable: boolean

	itemSet: ItemSet | null = null

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
		this.id = id
		this.name = name
		this.typeId = typeId
		this.level = level
		this.realWeight = realWeight
		this.cursed = cursed
		this.usable = usable
		this.exchangeable = exchangeable
		this.price = price
		this.etheral = etheral
		this.itemSetid = itemSetId
		this.criteria = criteria
		this.appearanceId = appearanceId
		this.dropMonsterIds = dropMonsterIds
		this.recipeSlots = recipeSlots
		this.recipeIds = recipeIds
		this.effects = effects
		this.craftXpRatio = craftXpRatio
		this.isSaleable = isSaleable
	}

	public init() {
		for (const item of Item.items.values()) {
			if (item.hasSet) {
				item.itemSet = ItemSet.getItemSet(item.itemSetid)
			}

			if (item.price < this.MINIMUM_ITEM_PRICE) {
				item.price = this.MINIMUM_ITEM_PRICE
			}
		}
	}

	public get typeEnum() {
		return ItemTypeEnum[this.typeId]
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

	public getItemSet() {
		if (this.itemSet === null) {
			this.itemSet = ItemSet.getItemSet(this.itemSetid)
		}

		return this.itemSet
	}
}

export default Item
