class Skill {
	private _id: number
	private _name: string
	private _parentJobId: number
	private _gatheredRessourceItem: number
	private _interactiveId: number
	private _levelMin: number

    private static skills: Map<number, Skill> = new Map<number, Skill>()

	constructor(
		id: number,
		name: string,
		parentJobId: number,
		gatheredRessourceItem: number,
		interactiveId: number,
		levelMin: number
	) {
		this._id = id
		this._name = name
		this._parentJobId = parentJobId
		this._gatheredRessourceItem = gatheredRessourceItem
		this._interactiveId = interactiveId
		this._levelMin = levelMin
	}

  public get Id(): number {
    return this._id
  }

  public get Name(): string {
    return this._name
  }

  public get ParentJobId(): number {
    return this._parentJobId
  }

  public get GatheredRessourceItem(): number {
    return this._gatheredRessourceItem
  }

  public get InteractiveId(): number {
    return this._interactiveId
  }

  public get LevelMin(): number {
    return this._levelMin
  }

  public static getSkills(): Map<number, Skill> {
    return this.skills
  }

  public static getSkill(id: number): Skill | undefined {
    return this.skills.get(id)
  }

  public static addSkill(skill: Skill): void {
    this.skills.set(skill.Id, skill)
  }

  public static getSkillByJobId(jobId: number): Skill | undefined {
    for (const skill of Skill.getSkills().values()) {
      if (skill.ParentJobId === jobId) {
        return skill
      }
    }
  }
}

export default Skill
