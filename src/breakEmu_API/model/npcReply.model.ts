import { GenericActionEnum } from "../../breakEmu_Protocol/IO/network/protocol"

class NpcReply {
	static npcReplies: Map<number, NpcReply> = new Map()
	id: number
	npcId: number
	replyId: number
	messageId: number
	action: GenericActionEnum
	param1: string
	param2: string
	param3: string
	criteria: string

	constructor(
		id: number,
		npcId: number,
		replyId: number,
		messageId: number,
		action: GenericActionEnum,
		param1: string,
		param2: string,
		param3: string,
		criteria: string
	) {
		this.id = id
		this.npcId = npcId
		this.replyId = replyId
		this.messageId = messageId
		this.action = action
		this.param1 = param1
		this.param2 = param2
		this.param3 = param3
		this.criteria = criteria
	}

	async saveReply(): Promise<void> {
		try {
			throw new Error("Method not implemented.")
		} catch (error) {
			console.error("Error while saving npc action", error as any)
		}
	}

	static getRepliesByNpcId(npcId: number): Map<number, NpcReply> {
		let replies: Map<number, NpcReply> = new Map()
		for (let [key, value] of NpcReply.npcReplies) {
			if (value.npcId === npcId) {
				replies.set(key, value)
			} else {
        console.log("not find replies by npcId:", npcId)
      }
		}
		return replies
	}


  static getRepliesByNpcIdAndMessageId(npcId: number, messageId: number): Map<number, NpcReply> {
    let replies: Map<number, NpcReply> = new Map()
    for (let [key, value] of NpcReply.npcReplies) {
      if (value.npcId === npcId && value.messageId === messageId) {
        replies.set(key, value)
      } else {
        console.log("not find replies by npcId and messageId:", npcId, messageId)
      }
    }
    return replies
  }
}

export default NpcReply
