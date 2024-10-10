import ContextEntityLook from "../../breakEmu_World/manager/entities/look/ContextEntityLook"
import GameMap from "./map.model"
import Entity from "../../breakEmu_World/manager/entities/Entity"
import {
	DirectionsEnum,
	EntityDispositionInformations,
	EntityLook,
	GameRolePlayNpcInformations,
	GenericActionEnum,
	NpcActionEnum,
} from "../../breakEmu_Protocol/IO/network/protocol"
import NpcAction from "./npcAction.model"
import NpcReply from "./npcReply.model"
import MapPoint from "../../breakEmu_World/manager/map/MapPoint"
import Container from "@breakEmu_Core/container/Container"
import NpcController from "@breakEmu_API/controller/npc.controller"
import Character from "./character.model"
import NpcActionHandler from "@breakEmu_World/handlers/map/npc/NpcActionHandler"

class Npc extends Entity {
	static npcs: Map<number, Npc> = new Map()
	public container: Container = Container.getInstance()
	public npcController = this.container.get(NpcController)
	point: MapPoint
	id: number
	npcId: number
	name: string
	look: ContextEntityLook
	gender: number
	mapId: number
	cellId: number
	direction: DirectionsEnum

	actions: Map<number, NpcAction> = new Map()
	replies: Map<number, NpcReply> = new Map()

	constructor(
		id: number,
		npcId: number,
		name: string,
		look: string | ContextEntityLook,
		gender: number,
		mapId: number,
		cellId: number,
		direction: DirectionsEnum
	) {
		super(mapId)
		this.id = id
		this.npcId = npcId
		this.name = name
		this.look =
			typeof look === "string" ? ContextEntityLook.parseFromString(look) : look
		this.gender = gender
		this.mapId = mapId
		this.cellId = cellId
		this.direction = direction

		this.actions = NpcAction.getActionsByNpcId(this.id)

		this.replies = NpcReply.getRepliesByNpcId(this.id)
	}

	public getActorInformations(): GameRolePlayNpcInformations {
		const entityDisposition = new EntityDispositionInformations(
			this.cellId,
			this.direction
		)

		return new GameRolePlayNpcInformations(
			this.id,
			entityDisposition,
			this.look.toEntityLook(),
			this.npcId,
			this.gender === 0 ? false : true,
			0
		)
	}

	static async newNpc(
		npcId: number,
		name: string,
		look: string | ContextEntityLook,
		gender: number,
		mapId: number,
		cellId: number,
		direction: DirectionsEnum,
		map: GameMap
	): Promise<Npc> {
		const id = Npc.npcs.size + 1
		const npc = new Npc(id, npcId, name, look, gender, mapId, cellId, direction)

		try {
			await npc.saveNpc()
			Npc.npcs.set(id, npc)
			await map.instance().addEntity(npc)
		} catch (error) {
			console.log(error)
		}
		return npc
	}

	async addNewAction(
		npcId: number,
		action: NpcActionEnum,
		param1: string,
		param2: string,
		param3: string,
		criteria: string
	): Promise<NpcAction> {
		const newActionId = NpcAction.npcActions.size + 1
		const newAction = new NpcAction(
			newActionId,
			npcId,
			action,
			param1,
			param2,
			param3,
			criteria
		)

		this.actions.set(newActionId, newAction)

		try {
			await newAction.saveAction()
		} catch (error) {
			console.log(error)
		}

		return newAction
	}

	async addNewReply(
		id: number,
		npcId: number,
		replyId: number,
		messageId: number,
		action: GenericActionEnum,
		param1: string,
		param2: string,
		param3: string,
		criteria: string
	): Promise<NpcReply> {
		const newReplyId = NpcReply.npcReplies.size + 1
		const newReply = new NpcReply(
			newReplyId,
			npcId,
			replyId,
			messageId,
			action,
			param1,
			param2,
			param3,
			criteria
		)
		try {
			await newReply.saveReply()
		} catch (error) {
			console.log(error)
		}
		return newReply
	}

	async saveNpc(): Promise<void> {
		try {
			if (Npc.npcs.has(this.id)) {
				await this.npcController.updateNpc(this)
				return
			}

			await this.npcController.createNpc(this)
		} catch (error) {
			console.error("Error while saving npc", error as any)
		}
	}

	async deleteNpc(): Promise<void> {
		try {
			await this.npcController.deleteNpc(this)
		} catch (error) {
			console.error("Error while deleting npc", error as any)
		}
	}

	async interact(character: Character, actionId: NpcActionEnum) {
		if (character.busy) {
			return
		}

		for (const action of this.actions.values()) {
			if (action.action === actionId) {
				await NpcActionHandler.handleAction(character, action)
				return
			} else {
				console.error(`Action not found for npc ${this.name} (${this.id})`)
			}
		}
	}
}

export default Npc
