import ContextEntityLook from "@breakEmu_World/manager/entities/look/ContextEntityLook"

class NpcTemplate {
  static npcs: Map<number, NpcTemplate> = new Map()
	id: number
	name: string
	gender: number
	actions: number[]
	messages: [number, number][]
	replies: [number, number][]
  look: ContextEntityLook

	constructor(
		id: number,
		name: string,
		gender: number,
    look: string,
		actions: number[],
		messages: [number, number][],
		replies: [number, number][]
	) {
		this.id = id
		this.name = name
		this.gender = gender
		this.actions = actions
		this.messages = messages
		this.replies = replies
    this.look = ContextEntityLook.parseFromString(look)
	}
}

export default NpcTemplate