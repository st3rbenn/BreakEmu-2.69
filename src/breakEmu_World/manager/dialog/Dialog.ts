import Character from "../../../breakEmu_API/model/character.model"
import Logger from "../../../breakEmu_Core/Logger"

abstract class Dialog {
	abstract logger: Logger

	abstract character: Character
	abstract open(): Promise<void>
	abstract close(): Promise<void>

  
}

export default Dialog
