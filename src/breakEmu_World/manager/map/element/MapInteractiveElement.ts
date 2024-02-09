import InteractiveElementModel from "../../../../breakEmu_API/model/InteractiveElement.model"
import Character from "../../../../breakEmu_API/model/character.model"
import { InteractiveElement } from "../../../../breakEmu_Server/IO"
import MapInstance from "../MapInstance"
import { InteractiveElementSkill } from "./../../../../breakEmu_Server/IO/network/protocol"
import MapElement from "./MapElement"

class MapInteractiveElement extends MapElement {
	constructor(record: InteractiveElementModel, mapInstance: MapInstance) {
		super(record, mapInstance)
	}

	public getInteractiveElement(character: Character): InteractiveElement {
		const interactiveElementSkills: InteractiveElementSkill[] = [
			// new InteractiveElementSkill(
			// 	this.record.skill.skillId,
			// 	this.record.skill.id
			// ),
		]

		character.skillsAllowed.forEach((skill) => {
			if (skill.Id == this.record.skill.record.Id) {
				interactiveElementSkills.push(
					new InteractiveElementSkill(
						this.record.skill.skillId,
						this.record.skill.id
					)
				)
			}
		})

		console.log(interactiveElementSkills)

		if (interactiveElementSkills.length >= 1) {
			return new InteractiveElement(
				this.record.elementId,
				this.record.skill.type,
				interactiveElementSkills,
				[new InteractiveElementSkill(0, 0)],
				true
			)
		} else {
			return new InteractiveElement(
				this.record.elementId,
				this.record.skill.type,
				[new InteractiveElementSkill(0, 0)],
				interactiveElementSkills,
				true
			)
		}
	}
}

export default MapInteractiveElement
