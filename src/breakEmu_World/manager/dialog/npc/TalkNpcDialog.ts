import Logger from "@breakEmu_Core/Logger"
import NpcDialog from "./NpcDialog"
import {
	DialogTypeEnum,
	LeaveDialogMessage,
	NpcActionEnum,
	NpcDialogCreationMessage,
	NpcDialogQuestionMessage,
} from "@breakEmu_Protocol/IO"
import Npc from "@breakEmu_API/model/npc.model"
import Character from "@breakEmu_API/model/character.model"
import NpcAction from "@breakEmu_API/model/npcAction.model"
import NpcReply from "@breakEmu_API/model/npcReply.model"
import MessageCriteriaManager from "./criteria/MessageCriteriaManager"

class TalkNpcDialog extends NpcDialog {
	logger: Logger

	dialogType: DialogTypeEnum = DialogTypeEnum.DIALOG_DIALOG

	npcActionId: NpcActionEnum = NpcActionEnum.TALK

	npc: Npc
	messageId: number
	replies: Map<number, NpcReply> = new Map()

	criteriaManager: MessageCriteriaManager

	constructor(character: Character, npc: Npc, action: NpcAction) {
		super()
		this.character = character
		this.npc = npc
		this.messageId = parseInt(action.param1)

		this.replies = NpcReply.getRepliesByNpcIdAndMessageId(
			this.npc.id,
			this.messageId
		)

		this.criteriaManager = new MessageCriteriaManager(
			action.criteria,
			this.character
		)
	}

	async open(): Promise<void> {
		try {
			this.character.isNpcDialog = true
			this.character.dialog = this
			console.log(`i'm talking to ${this.npc.name}`)

			const repliesIds: number[] = []

			for (let reply of this.replies.values()) {
				repliesIds.push(reply.replyId)
			}

			await this.character.client.Send(
				new NpcDialogCreationMessage(this.npc.mapId, this.npc.id)
			)

			await this.character.client.Send(
				new NpcDialogQuestionMessage(
					this.messageId,
					this.criteriaManager
						.generateCriteria()
						.map((cr) => cr.handleCriteriaResultValue()) || [],
					repliesIds
				)
			)
		} catch (error) {
			this.logger.error("Error while opening craft exchange: ", error as any)
		}
	}

	async close(): Promise<void> {
    this.character.removeDialog()
		this.character.isNpcDialog = false
	}
}

export default TalkNpcDialog
