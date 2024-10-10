import Effect from "@breakEmu_World/manager/entities/effect/Effect"
import {
	CharacterInventoryPositionEnum,
	ObjectItem,
	ObjectItemNotInContainer,
	ObjectItemQuantity,
} from "@breakEmu_Protocol/IO"
import EffectCollection from "@breakEmu_World/manager/entities/effect/EffectCollection"
import AbstractItem from "@breakEmu_World/manager/items/AbstractItem"
import CharacterItemController from "../controller/characterItem.controller"
import Item from "./item.model"
import Container from "@breakEmu_Core/container/Container"
import { randomUUID } from "crypto"
import BankItem from "./BankItem.model"

class CharacterItem extends AbstractItem {
	characterId: number
  private container: Container = Container.getInstance()

	constructor(
		characterId: number,
		gId: number,
		quantity: number,
		position: number,
		look: string,
		effects: EffectCollection,
		appearanceId: number,
    id?: number
	) {
		super(gId, position, quantity, effects, appearanceId, look, id)
		this.characterId = characterId
	}

	public isEquiped(): boolean {
		return (
			this.positionEnum !=
			CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED
		)
	}

	public getObjectItemNotInContainer(): ObjectItemNotInContainer {
		return new ObjectItemNotInContainer(
			this.gId,
			this.effects.getObjectEffects(),
			this.id,
			this.quantity
		)
	}

	public getObjectItem(): ObjectItem {
		return new ObjectItem(
			this.position,
			this.gId,
			this.effects.getObjectEffects(),
			this.id,
			this.quantity
		)
	}

  public getObjectQuantity(): ObjectItemQuantity {
    return new ObjectItemQuantity(this.id, this.quantity)
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

	public canBeExchanged(): boolean {
		return this.record.exchangeable
	}

  public hasSet(): boolean {
    return this.record.itemSetid !== 0
  }

  public clone(quantity?: number): CharacterItem {
    const clone = new CharacterItem(
      this.characterId,
      this.gId,
      quantity || this.quantity,
      this.position,
      this.look,
      this.effects,
      this.appearanceId
    )
    return clone
  }

  public async save(): Promise<void> {
    await this.container.get(CharacterItemController).updateItem(this)
  }

  public static async createFromItem(item: Item, characterId: number): Promise<CharacterItem> {
    const characterItem = new CharacterItem(
      characterId,
      item.id,
      1,
      CharacterInventoryPositionEnum.INVENTORY_POSITION_NOT_EQUIPED,
      "",
      item.effects,
      item.appearanceId
    )

    await characterItem.save()
    return characterItem
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

  public toBankItem(accountId: number): BankItem {
    return new BankItem(
      this.id,
      this.gId,
      this.position,
      this.quantity,
      this.effects,
      this.appearanceId,
      this.look,
      accountId,
      this.characterId
    )
  }
}

export default CharacterItem
