import InteractiveElementModel from "../../../../breakEmu_API/model/InteractiveElement.model"
import Character from "../../../../breakEmu_API/model/character.model"
import { InteractiveElement } from "../../../../breakEmu_Server/IO"
import MapInstance from "../MapInstance"
import {
	InteractiveElementSkill,
	InteractiveElementWithAgeBonus,
} from "./../../../../breakEmu_Server/IO/network/protocol"
import MapElement from "./MapElement"

class MapInteractiveElement extends MapElement {
	constructor(record: InteractiveElementModel, mapInstance: MapInstance) {
		super(record, mapInstance)
	}

	public getInteractiveElement(character: Character): InteractiveElement {
		const interactiveElementSkills: InteractiveElementSkill[] = [
			new InteractiveElementSkill(
				this.record.skill?.skillId,
				this.record.skill?.id
			),
		]

		if (
			character.skillsAllowed.get(this.record?.skill?.skillId) &&
			this.record.harvestable &&
			!character.busy
		) {
			// console.log('Allowed skills: ', this.record?.skill?.skillId)
			return new InteractiveElementWithAgeBonus(
				this.record?.skill?.identifier,
				this.record?.skill?.type,
				interactiveElementSkills,
				[],
				character.mapId === this.record.mapId,
				this.record.ageBonus
			)
		} else {
			// console.log('Not allowed skills: ', this.record?.skill?.skillId)
			return new InteractiveElementWithAgeBonus(
				this.record?.skill?.identifier,
				this.record?.skill?.type,
				[],
				interactiveElementSkills,
				character.mapId === this.record.mapId,
				this.record.ageBonus
			)
		}
	}
}

export default MapInteractiveElement
