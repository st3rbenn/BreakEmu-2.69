import Character from "../../breakEmu_API/model/character.model"
import { GameContextEnum } from "../../breakEmu_Server/IO"

class ContextHandler {
	public static async handleGameContextCreateMessage(character: Character) {
		let inFight: boolean = false
		character.inGame = true

		if (inFight) {
			await character.destroyContext()
			await character.createContext(GameContextEnum.FIGHT)
		} else {
			await character.createContext(GameContextEnum.ROLE_PLAY)

			await character.teleport(
				character.mapId as number,
				character.cellId as number
			)
			await character.refreshStats()
		}
	}
}

export default ContextHandler
