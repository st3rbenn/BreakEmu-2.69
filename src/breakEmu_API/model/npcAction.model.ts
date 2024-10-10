import { NpcActionEnum } from "./../../breakEmu_Protocol/IO/network/protocol"

class NpcAction {
	static npcActions: Map<number, NpcAction> = new Map()
	id: number
	npcId: number
	action: NpcActionEnum
	param1: string
	param2: string
	param3: string
	criteria: string

	constructor(
		id: number,
		npcId: number,
		action: NpcActionEnum,
		param1: string,
		param2: string,
		param3: string,
		criteria: string
	) {
		this.id = id
		this.npcId = npcId
		this.action = action
		this.param1 = param1
		this.param2 = param2
		this.param3 = param3
		this.criteria = criteria
	}

	async saveAction(): Promise<void> {
		try {
			throw new Error("Method not implemented.")
		} catch (error) {
			console.error("Error while saving npc action", error as any)
		}
	}


  static getActionsByNpcId(npcId: number): Map<number, NpcAction> {
    let actions: Map<number, NpcAction> = new Map()
    for (let value of NpcAction.npcActions.values()) {
      if (value.npcId === npcId) {
        actions.set(value.id, value)
      } else {
        console.log("not find actions by npcId:", npcId)
      }
    }
    return actions
  }
}

export default NpcAction
