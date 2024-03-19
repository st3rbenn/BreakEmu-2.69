import Character from "../../../../../breakEmu_API/model/character.model"
import MapElement from "../MapElement"

interface IInteractiveElementHandler {
	handle(
		element: MapElement,
		character: Character
	): Promise<void>
}

export default IInteractiveElementHandler
