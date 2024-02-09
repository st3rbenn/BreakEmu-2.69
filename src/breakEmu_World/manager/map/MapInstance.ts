import InteractiveElementModel from "breakEmu_API/model/InteractiveElement.model"
import Character from "../../../breakEmu_API/model/character.model"
import GameMap from "../../../breakEmu_API/model/map.model"
import {
	DofusMessage,
	FightStartingPositions,
	GameContextRemoveElementMessage,
	GameRolePlayShowActorMessage,
	InteractiveElement,
	MapComplementaryInformationsDataMessage,
	MapObstacle,
	StatedElement,
} from "../../../breakEmu_Server/IO"
import WorldClient from "../../WorldClient"
import Entity from "../entities/Entity"
import MapElement from "./element/MapElement"
import MapInteractiveElement from "./element/MapInteractiveElement"
import MapStatedElement from "./element/MapStatedElement"
class MapInstance {
	/*get monsterGroupCount(): number {
        return this.getEntities(MonsterGroup)
    }*/

	private entities: Map<any, Entity> = new Map()
	private elements: Map<any, MapElement> = new Map()

	public mute: boolean = false

	public record: GameMap

	constructor(map: GameMap) {
		this.record = map
	}

	get charactersCount(): number {
		return this.getEntities<Character>(Character).length
	}

	public getEntities<T>(type: { new (...args: any[]): T }): T[] {
		let entities: T[] = []

		this.entities.forEach((entity: Entity) => {
			if (entity instanceof type) {
				entities.push(entity)
			}
		})

		return entities
	}

	public getElements<T>(type: { new (...args: any[]): T }): T[] {
		let elements: T[] = []

		this.elements.forEach((element: MapElement) => {
			if (element instanceof type) {
				elements.push(element)
			}
		})

		return elements
	}

	public async addEntity(entity: Entity) {
		console.log(
			`Add entity: (${entity._name}) on map: (${this.record.id}) at cell: (${entity._cellId})`
		)
		if (this.entities.has(entity._id)) {
			return
		}

		this.entities.set(entity._id, entity)

		let actorInformations = entity.getActorInformations()
		await this.send(new GameRolePlayShowActorMessage(actorInformations))
	}

	public async addElement(element: InteractiveElementModel) {
		const elem = element.getMapElement(this)
		this.elements.set(element.elementId, elem)
	}

	public async removeEntity(entity: Entity) {
		let entityId = entity._id
		await this.send(new GameContextRemoveElementMessage(entityId))
		this.entities.delete(entity._id)
	}

	public async sendMapComplementaryInformations(
		client: WorldClient
	): Promise<void> {
		const entities = this.getEntities<Character>(Character).map(
			(character: Character) => {
				return character.getActorInformations()
			}
		)

		const interactiveElements = this.getInteractiveElements(
			client?.selectedCharacter
		)

		const statedElements = this.getStatedElements()

		const mapComplementary = new MapComplementaryInformationsDataMessage(
			this.record.subareaId,
			this.record.id,
			[],
			entities,
			interactiveElements,
			statedElements,
			[new MapObstacle(0, 0)],
			[],
			false,
			new FightStartingPositions([], [])
		)

    // console.log("MapComplementaryInformationsDataMessage", mapComplementary)

		await client.Send(client.serialize(mapComplementary))
	}

	public getStatedElements(): StatedElement[] {
		return this.getElements<MapStatedElement>(
			MapStatedElement
		).map((element: MapStatedElement) => element.getStatedElement())
	}

	public getInteractiveElements(character: Character): InteractiveElement[] {
		return this.getElements<MapInteractiveElement>(
			MapInteractiveElement
		).map((element: MapInteractiveElement) =>
			element.getInteractiveElement(character)
		)
	}

	public async send(message: DofusMessage) {
		for (const player of this.getEntities<Character>(Character)) {
			await player.client?.Send(player.client?.serialize(message))
		}
	}
}

export default MapInstance
