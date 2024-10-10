import Skill from "./skill.model"

class InteractiveSkill {
	id: number
	mapId: number
	identifier: number
	actionIdentifier: number
	type: number
	skillId: number

	record: Skill | undefined
	param1: string | undefined
	param2: string | undefined
	param3: string | undefined
	criteria: string | undefined

	static interactiveSkills: Map<number, InteractiveSkill> = new Map<
		number,
		InteractiveSkill
	>()

	constructor(
		id: number,
		mapId: number,
		identifier: number,
		actionIdentifier: string,
		type: string,
		skillId: string,
		param1: string,
		param2: string,
		param3: string,
		criteria: string
	) {
		this.id = id
		this.mapId = mapId
		this.identifier = identifier
		this.actionIdentifier = parseInt(actionIdentifier)
		this.skillId = parseInt(skillId)
		this.type = parseInt(type)
		this.param1 = param1 !== "" ? param1 : ""
		this.param2 = param2 !== "" ? param2 : ""
		this.param3 = param3 !== "" ? param3 : ""
		this.criteria = criteria !== "" ? criteria : ""
	}

	public static getInteractiveSkills(): Map<number, InteractiveSkill> {
		return this.interactiveSkills
	}

	public static getInteractiveSkill(id: number): InteractiveSkill | undefined {
		return this.interactiveSkills.get(id)
	}

	public static addInteractiveSkill(interactiveSkill: InteractiveSkill): void {
		this.interactiveSkills.set(interactiveSkill.id, interactiveSkill)
	}

	public static getByIdentifier(
		identifier: number
	): InteractiveSkill | undefined {
		for (const interactiveSkill of this.interactiveSkills.values()) {
			if (interactiveSkill.identifier === identifier) {
				return interactiveSkill
			}
		}
	}

	public static getByMapId(mapId: number): InteractiveSkill[] {
		const interactiveSkills: InteractiveSkill[] = []
		for (const interactiveSkill of this.interactiveSkills.values()) {
			if (interactiveSkill.mapId === mapId) {
				interactiveSkills.push(interactiveSkill)
			}
		}
		return interactiveSkills
	}

	public static getByMapIdAndIdentifier(
		mapId: number,
		identifier: number
	): InteractiveSkill | undefined {
		for (const interactiveSkill of this.interactiveSkills.values()) {
			if (
				interactiveSkill.mapId === mapId &&
				interactiveSkill.identifier === identifier
			) {
				return interactiveSkill
			}
		}
	}
}

export default InteractiveSkill
