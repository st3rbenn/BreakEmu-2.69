import { NpcActionEnum } from "@breakEmu_Protocol/IO"
import Dialog from "../Dialog"

abstract class NpcDialog extends Dialog {
	abstract npcActionId: NpcActionEnum
}

export default NpcDialog
