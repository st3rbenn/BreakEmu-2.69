import Character from "@breakEmu_API/model/character.model"
import Npc from "@breakEmu_API/model/npc.model"

interface INpcInteractionHandler {
	interact(character: Character, npc: Npc): Promise<void>
}

export default INpcInteractionHandler
