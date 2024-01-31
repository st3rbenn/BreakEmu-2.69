import Effect from "breakEmu_World/manager/entities/effect/Effect"
import EffectCollection from "../../breakEmu_World/manager/entities/effect/EffectCollection"
import Item from "./item.model"

class ItemSet {
	private _id: number
	private _name: string
	private _items: Map<number, Item>
	private _effects: EffectCollection[]

	public static itemSets: Map<number, ItemSet> = new Map<number, ItemSet>()

	constructor(
		id: number,
		name: string,
		items: number[],
		effects: EffectCollection[]
	) {
		this._id = id
		this._name = name
		this._effects = effects

		this._items = new Map<number, Item>()

		for (const itemId of items) {
			this._items.set(itemId, Item.getItem(itemId))
		}
	}

	public static initialize(): void {
		for (const itemSet of this.itemSets.values()) {
			for (let i = 0; i < itemSet.items.size; i++) {
				itemSet.effects[i] = itemSet.effects[i].generate()
			}
		}
	}

	public static getItemSet(id: number): ItemSet {
		return this.itemSets.get(id) as ItemSet
	}

	public static addItemSet(itemSet: ItemSet): void {
		this.itemSets.set(itemSet.id, itemSet)
	}

	public static removeItemSet(id: number): void {
		this.itemSets.delete(id)
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

	public get items(): Map<number, Item> {
		return this._items
	}

	public set items(items: Map<number, Item>) {
		this._items = items
	}

	public get effects(): EffectCollection[] {
		return this._effects
	}

	public set effects(effects: EffectCollection[]) {
		this._effects = effects
	}

	public getEffects(itemCount: number): EffectCollection {
		if (this.effects.length >= itemCount) {
			const effects: Effect[] = []

			this.effects.forEach((effect, key) => {
				if (effects.length < itemCount) {
					effect.effects.forEach((effect) => {
						effects.push(effect)
					})
				}
			})

			return new EffectCollection(effects)
		} else {
			return new EffectCollection()
		}
	}
}

export default ItemSet
