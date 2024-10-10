import Character from "@breakEmu_API/model/character.model"
import Npc from "@breakEmu_API/model/npc.model"
import NpcAction from "@breakEmu_API/model/npcAction.model"
import Logger from "@breakEmu_Core/Logger"
import { NpcActionEnum } from "@breakEmu_Protocol/IO"
import TalkNpcDialog from "@breakEmu_World/manager/dialog/npc/TalkNpcDialog"

class NpcActionHandler {
	static logger: Logger = new Logger("NpcActionHandler")
	private static handler: {
		[key: string]: (character: Character, action: NpcAction) => Promise<void>
	} = {
		[NpcActionEnum.TALK]: async (character: Character, action: NpcAction) => {
			try {
				const npc = Npc.npcs.get(action.npcId)
				if (npc) {
					await character.reply(`i'm talking to ${npc.name}`)

          const dialog = new TalkNpcDialog(character, npc, action)

          await dialog.open()
				}
			} catch (error) {
				console.error("Error while talking to npc", error as any)
			}
		},
		[NpcActionEnum.EXCHANGE]: async (
			character: Character,
			action: NpcAction
		) => {
			try {
				// const npc = Npc.getNpcById(action.npcId)
				// if (npc) {
				//   await npc.exchange(character)
				// }
			} catch (error) {
				console.error("Error while exchanging with npc", error as any)
			}
		},
		[NpcActionEnum.BUY11 || NpcActionEnum.BUY6]: async (
			character: Character,
			action: NpcAction
		) => {
			try {
				// const npc = Npc.getNpcById(action.npcId)
				// if (npc) {
				//   await npc.buy(character, action.param1)
				// }
			} catch (error) {
				console.error("Error while buying from npc", error as any)
			}
		},
		[NpcActionEnum.SELL12 || NpcActionEnum.SELL5]: async (
			character: Character,
			action: NpcAction
		) => {
			try {
				// const npc = Npc.getNpcById(action.npcId)
				// if (npc) {
				//   await npc.sell(character, action.param1)
				// }
			} catch (error) {
				console.error("Error while selling to npc", error as any)
			}
		},
	}

	static async handleAction(
		character: Character,
		action: NpcAction
	): Promise<void> {
		const actionHandler = this.handler[action.action]
		if (actionHandler) {
			await actionHandler(character, action)
		} else {
			this.logger.error(
				`Action ${action.action} not implemented for character: ${character.name}`
			)
		}
	}
}

export default NpcActionHandler
