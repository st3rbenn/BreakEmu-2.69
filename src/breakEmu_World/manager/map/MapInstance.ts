import InteractiveElementModel from "@breakEmu_API/model/InteractiveElement.model"
import Character from "@breakEmu_API/model/character.model"
import GameMap from "@breakEmu_API/model/map.model"
import Skill from "@breakEmu_API/model/skill.model"
import {
	DofusMessage,
	FightCommonInformations,
	FightStartingPositions,
	GameContextRemoveElementMessage,
	GameRolePlayShowActorMessage,
	HouseInformations,
	InteractiveElement,
	InteractiveElementUpdatedMessage,
	InteractiveTypeEnum,
	InteractiveUseErrorMessage,
	InteractiveUsedMessage,
	MapComplementaryInformationsDataMessage,
	MapFightCountMessage,
	StatedElement,
} from "@breakEmu_Protocol/IO"
import WorldClient from "../../WorldClient"
import Entity from "../entities/Entity"
import SkillManager from "../skills/SkillManager"
import MapElement from "./element/MapElement"
import MapInteractiveElement from "./element/MapInteractiveElement"
import MapStatedElement from "./element/MapStatedElement"
import HandlerRegistry from "./element/interactiveElement/HandlerRegistry"

class MapInstance {
	/*get monsterGroupCount(): number {
        return this.getEntities(MonsterGroup)
    }*/

	private entities: Map<any, Entity> = new Map()
	public elements: Map<any, MapElement> = new Map()

	private handlerRegistry: HandlerRegistry = HandlerRegistry.getInstance()

	public mute: boolean = false

	public record: GameMap

	constructor(map: GameMap) {
		this.record = map

		this.record.elements.forEach((element: InteractiveElementModel) => {
			this.addElement(element)
		})
	}

	public async init(): Promise<MapInstance> {
		return this
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
		if (this.entities.has(entity.id)) {
			return
		}
		console.log(
			`Add entity: (${entity.name}) on map: (${this.record.id}) at cell: (${entity.cellId})`
		)

		let actorInformations = entity.getActorInformations()
		try {
			await this.send(new GameRolePlayShowActorMessage(actorInformations))

			this.entities.set(entity.id, entity)
		} catch (error) {
			console.log(error)
		}
	}

	public addElement(element: InteractiveElementModel) {
		const elem = element.getMapElement(this)
		this.elements.set(element.elementId, elem)
	}

	public async removeEntity(entity: Entity) {
		let entityId = entity.id
		await this.send(new GameContextRemoveElementMessage(entityId))
		this.entities.delete(entity.id)
	}

	public async sendMapComplementaryInformations(
		client: WorldClient
	): Promise<void> {
		try {
			const entities = this.getEntities<Character>(Character).map(
				(character: Character) => {
					return character.getActorInformations()
				}
			)

			const interactiveElements = this.getInteractiveElements(
				client?.selectedCharacter
			)

			const statedElements = this.getStatedElements()

			const houses: HouseInformations[] = []
			const fightCommonInformations: FightCommonInformations[] = []

			const mapComplementary = new MapComplementaryInformationsDataMessage(
				this.record.subareaId,
				this.record.id,
				houses,
				entities,
				interactiveElements,
				statedElements,
				this.record.getMapObstacles(),
				fightCommonInformations,
				false,
				new FightStartingPositions([0], [0])
			)
			await client.Send(mapComplementary)
		} catch (error) {
			console.log(error)
		}
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
		try {
			for (const player of this.getEntities<Character>(Character)) {
				await player.client?.Send(message)
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async useInteractiveElement(
		character: Character,
		elementId: number,
		skillInstanceUid: number
	) {
		try {
			let element = this.getElements<MapElement>(MapElement as any).find(
				(element: MapElement) => element.record.elementId === elementId
			)

			console.log(
				"use interactive element",
				elementId,
				skillInstanceUid,
				element?.record?.skill?.type
			)

			if (!element) {
				await character.client?.Send(
					new InteractiveUseErrorMessage(elementId, skillInstanceUid)
				)
				return
			}
			if (!element.caneUse(character) && character.busy) {
				await character.client?.Send(
					new InteractiveUseErrorMessage(elementId, skillInstanceUid)
				)
				return
			}
			const canMove =
				element?.record?.skill?.record?.gatheredRessourceItem == -1
			let duration = 0

			if (element?.record?.skill?.record) {
				if (!canMove) {
					duration = SkillManager.SKILL_DURATION
				} else {
					duration = 0
				}
			} else {
				duration = 0
			}

			await character.sendMap(
				new InteractiveUsedMessage(
					character.id,
					element.record.elementId,
					element.record.skill.skillId,
					duration,
					true
				)
			)

			const type = element?.record?.skill?.type
			const handler = this.handlerRegistry.getHandler(
				type as InteractiveTypeEnum
			)

			if (element?.record?.skill?.record === undefined) {
				console.log("the InteractiveSkill skill record is undefined")
				const skill = Skill.getSkill(element?.record?.skill?.skillId)

				if (skill) {
					element.record.skill.record = skill
				}
			}

			if (handler) {
				await handler.handle(character, element)
			} else if (type === 0) {
				await this.handleTeleportationElement(character, element)
			} else {
				console.log("no handler for type", type)
				// console.log("element", element)
			}

			// else if (
			// 	type === 0 &&
			// 	element?.record?.skill?.param1 !== undefined &&
			// 	element?.record?.skill?.param2 !== undefined
			// ) {
			// 	// Traitement spécifique pour le type 0
			// 	await character.teleport(
			// 		parseInt(element?.record?.skill?.param1),
			// 		parseInt(element?.record?.skill?.param2)
			// 	)
			// } else {
			// 	// Gérer l'erreur ou le cas par défaut
			// 	await character.client?.Send(
			// 		new InteractiveUseErrorMessage(elementId, skillInstanceUid)
			// 	)
			// }
		} catch (error) {
			console.log(error)
			await character.client?.Send(
				new InteractiveUseErrorMessage(elementId, skillInstanceUid)
			)
		}
	}

	public async handleTeleportationElement(
		character: Character,
		element: MapElement
	) {
		if (
			element.record.skill.param1 !== undefined &&
			element.record.skill.param2 !== undefined
		) {
			const map = GameMap.getMapById(parseInt(element.record.skill.param1))

			if (!map) {
				return
			}

			await character.teleport(
				parseInt(element.record.skill.param1),
				parseInt(element.record.skill.param2)
			)
		} else {
			console.log("try Teleportation element without params ?")
			console.log(element.record)
		}
	}

	public async forceUseInteractiveElement(
		character: Character,
		elementId: number,
		skillInstanceUid: number,
		mapId: number
	) {
		try {
			const map = GameMap.getMapById(mapId)!
			const element = map
				.instance()
				.getElements<MapElement>(MapElement as any)
				.find((element: MapElement) => element.record.elementId === elementId)

			if (!element) {
				await character.client?.Send(
					new InteractiveUseErrorMessage(elementId, skillInstanceUid)
				)
			} else {
				await character.sendMap(
					new InteractiveUsedMessage(
						character.id,
						element.record.elementId,
						element.record.skill.skillId,
						element instanceof MapStatedElement
							? SkillManager.SKILL_DURATION
							: 0,
						true
					)
				)
			}

			const type = element?.record.skill?.type
			const handler = this.handlerRegistry.getHandler(
				type as InteractiveTypeEnum
			)

			if (handler) {
				await handler.handle(character, element)
			} else if (
				type === 0 &&
				element?.record.skill?.param1 !== undefined &&
				element?.record.skill?.param2 !== undefined
			) {
				// Traitement spécifique pour le type 0
				await character.teleport(
					parseInt(element?.record.skill?.param1),
					parseInt(element?.record.skill?.param2)
				)
			} else {
				// Gérer l'erreur ou le cas par défaut
				await character.client?.Send(
					new InteractiveUseErrorMessage(elementId, skillInstanceUid)
				)
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async refresh(interactiveElement: InteractiveElement) {
		try {
			await this.send(new InteractiveElementUpdatedMessage(interactiveElement))
		} catch (error) {
			console.log(error)
		}
	}

	public async sendMapFightCount(client: WorldClient, fightCount: number) {
		//TODO: Implement this
		try {
			await client.Send(new MapFightCountMessage(fightCount))
		} catch (error) {
			console.log(error)
		}
	}

	public async isCharacterBlocked(character: Character): Promise<boolean> {
		return !this.record.isCellBlocked(character.cellId)
	}
}

export default MapInstance
