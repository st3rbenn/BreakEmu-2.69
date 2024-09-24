import {
	ObjectItem,
	ObjectItemNotInContainer,
	ObjectItemQuantity,
} from "@breakEmu_Protocol/IO"
import EffectCollection from "@breakEmu_World/manager/entities/effect/EffectCollection"
import AbstractItem from "@breakEmu_World/manager/items/AbstractItem"
import CharacterItem from "./characterItem.model"
import Container from "@breakEmu_Core/container/Container"
import bankItemController from "@breakEmu_API/controller/bankItem.controller"

class BankItem extends AbstractItem {
	characterId: number
	private container: Container = Container.getInstance()

	constructor(
		uId: number,
		gId: number,
		position: number,
		quantity: number,
		effects: EffectCollection,
		appearanceId: number,
		look: string,
		characterId: number
	) {
		super(gId, position, quantity, effects, appearanceId, look, uId)
		this.characterId = characterId
	}

	toCharacterItem(): CharacterItem {
		return new CharacterItem(
			this.characterId,
			this.gId,
			this.quantity,
			this.position,
			this.look,
			this.effects,
			this.appearanceId,
			this.id
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

	public async save(): Promise<void> {
		await this.container.get(bankItemController).updateBankItem(this, this.characterId)
	}

	public static async createFromCharacterItem(
		item: CharacterItem,
		characterId: number
	): Promise<BankItem> {
		const bankItem = item.toBankItem()

		await bankItem.save()
		return bankItem
	}

	public getObjectItemQuantity(): ObjectItemQuantity {
		return new ObjectItemQuantity(this.id, this.quantity)
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

export default BankItem
