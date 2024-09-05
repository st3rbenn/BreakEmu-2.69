import Character from "@breakEmu_API/model/character.model"
import Container from "@breakEmu_Core/container/Container"
import Logger from "@breakEmu_Core/Logger"

abstract class Dialog {
	abstract logger: Logger
  public container: Container = Container.getInstance()
	public character: Character
	abstract open(): Promise<void>
	abstract close(): Promise<void>

  
}

export default Dialog
