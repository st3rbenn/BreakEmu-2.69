import Effect from "../../breakEmu_World/manager/entities/effect/Effect"
import {
	CharacterInventoryPositionEnum,
	ObjectItem,
	ObjectItemNotInContainer,
	ObjectItemQuantity,
} from "../../breakEmu_Server/IO"
import EffectCollection from "../../breakEmu_World/manager/entities/effect/EffectCollection"
import AbstractItem from "../../breakEmu_World/manager/items/AbstractItem"
import CharacterItemController from "../controller/characterItem.controller"

class CharacterItem extends AbstractItem {
	private _characterId: number

	private static _charactersItems: Map<number, CharacterItem> = new Map<
		number,
		CharacterItem
	>()

	constructor(
		characterId: number,
		uid: string,
		gId: number,
		quantity: number,
		position: number,
		look: string,
		effects: EffectCollection,
		appearanceId: number
	) {
		super(uid, gId, position, quantity, effects, appearanceId, look)
		this._characterId = characterId
	}

	public isEquiped(): boolean {
		return (
			this.positionEnum !=
			CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
		)
	}

	public async getObjectItemNotInContainer(): Promise<ObjectItemNotInContainer> {
    const id = await CharacterItemController.getInstance().getIntIdFromUuid(this.uId)
		return new ObjectItemNotInContainer(
			this.gId,
			this.effects.getObjectEffects(),
			id as number,
			this.quantity
		)
	}

	public override async getObjectItem(): Promise<ObjectItem> {
    const id = await CharacterItemController.getInstance().getIntIdFromUuid(this.uId)
		return new ObjectItem(
			this.position,
			this.gId,
			this.effects.getObjectEffects(),
			id as number,
			this.quantity
		)
	}

	public getObjectItemQuantity(): ObjectItemQuantity {
		throw new Error("Method not implemented.")
	}

	public cloneWithUID(): AbstractItem {
		throw new Error("Method not implemented.")
	}

	public cloneWithoutUID(): AbstractItem {
		throw new Error("Method not implemented.")
	}

	public initialize(): void {
		return
	}

	public get characterId(): number {
		return this._characterId
	}

	public set characterId(value: number) {
		this._characterId = value
	}

	public static get charactersItems(): Map<number, CharacterItem> {
		return this._charactersItems
	}

	public static getCharacterItems(characterId: number): CharacterItem[] {
		const result: CharacterItem[] = []

		for (const characterItem of this._charactersItems.values()) {
			if (characterItem.characterId === characterId) {
				result.push(characterItem)
			}
		}

		return result
	}

	public canBeExchanged(): boolean {
		return this.record.exchangeable
	}

	public static async addItem(characterItem: CharacterItem): Promise<void> {
    const id = await CharacterItemController.getInstance().getIntIdFromUuid(characterItem.uId)
		this._charactersItems.set(id as number, characterItem)
	}

	public static removeItem(uId: number): void {
		this._charactersItems.delete(uId)
	}

	public static getItem(uId: number): CharacterItem {
		return this._charactersItems.get(uId) as CharacterItem
	}

  public hasSet(): boolean {
    return this.record.itemSetid !== 0
  }

  public clone(): CharacterItem {
    return new CharacterItem(
      this.characterId,
      this.uId,
      this.gId,
      this.quantity,
      this.position,
      this.look,
      this.effects,
      this.appearanceId
    )
  }

  public async save(): Promise<void> {
    await CharacterItemController.getInstance().updateItem(this)
  }

  public getEffects(itemCount: number): EffectCollection {
    if(this.effects.effects.size >= itemCount) {
      const effects: Effect[] = []

      this.effects.effects.forEach((effect, key) => {
        if(effects.length < itemCount) {
          effects.push(effect)
        }
      })

      return new EffectCollection(effects)
    } else {
      return new EffectCollection()
    }
  }
}

export default CharacterItem
