import Character from "@breakEmu_API/model/character.model"
import MapElement from "../MapElement"

interface IInteractiveElementHandler {
	handle(
		character: Character,
		element?: MapElement
	): Promise<void>
}

export default IInteractiveElementHandler
