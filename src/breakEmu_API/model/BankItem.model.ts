import { ObjectItem, ObjectItemQuantity } from "@breakEmu_Protocol/IO"
import AbstractItem from "@breakEmu_World/manager/items/AbstractItem"

class BankItem extends AbstractItem {
	accountId: number

	constructor(
		uId: string,
		gId: number,
		position: number,
		quantity: number,
		effects: any,
		appearanceId: number,
		look: string,
		accountId: number
	) {
		super(uId, gId, position, quantity, effects, appearanceId, look)
		this.accountId = accountId
	}

	getObjectItem(): Promise<ObjectItem> {
		throw new Error("Method not implemented.")
	}
	getObjectItemQuantity(): ObjectItemQuantity {
		throw new Error("Method not implemented.")
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
