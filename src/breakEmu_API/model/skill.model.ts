class Skill {
	id: number
	name: string
	parentJobId: number
	gatheredRessourceItem: number
	interactiveId: number
	levelMin: number

	private static skills: Map<number, Skill> = new Map<number, Skill>()

	constructor(
		id: number,
		name: string,
		parentJobId: number,
		gatheredRessourceItem: number,
		interactiveId: number,
		levelMin: number
	) {
		this.id = id
		this.name = name
		this.parentJobId = parentJobId
		this.gatheredRessourceItem = gatheredRessourceItem
		this.interactiveId = interactiveId
		this.levelMin = levelMin
	}

	public static getSkills(): Map<number, Skill> {
		return this.skills
	}

	public static getSkill(id: number): Skill | undefined {
		return this.skills.get(id)
	}

	public static addSkill(skill: Skill): void {
		this.skills.set(skill.id, skill)
	}

	public static getSkillByJobId(jobId: number): Skill | undefined {
		for (const skill of Skill.getSkills().values()) {
			if (skill.parentJobId === jobId) {
				return skill
			}
		}
	}

	public static getSkillByElementTypeId(
		elementTypeId: number
	): Skill | undefined {
		for (const skill of Skill.getSkills().values()) {
			if (skill.interactiveId === elementTypeId) {
				return skill
			} else {
				return undefined
			}
		}
	}
}

export default Skill
