import Effect from "breakEmu_World/manager/entities/effect/Effect"
import EffectCollection from "@breakEmu_World/manager/entities/effect/EffectCollection"
import Item from "./item.model"

class ItemSet {
	id: number
	name: string
	items: Map<number, Item>
	effects: EffectCollection[]

	public static itemSets: Map<number, ItemSet> = new Map<number, ItemSet>()

	constructor(
		id: number,
		name: string,
		items: number[],
		effects: EffectCollection[]
	) {
		this.id = id
		this.name = name
		this.effects = effects
		this.items = new Map<number, Item>()

		for (const itemId of items) {
			this.items.set(itemId, Item.getItem(itemId))
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
