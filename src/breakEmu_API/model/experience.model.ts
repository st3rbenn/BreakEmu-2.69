class Experience {
	private _level: number
	private _experience: number

	private static _maxLevel: number
	private static _experienceLevels: Experience[] = []

	constructor(level: number, experience: number) {
		this._level = level
		this._experience = experience
	}

	public get level(): number {
		return this._level
	}

	public get experience(): number {
		return this._experience
	}

	public static get experienceLevels(): Experience[] {
		return this._experienceLevels
	}

	public static set experienceLevels(experienceLevels: Experience[]) {
		this._experienceLevels = experienceLevels

		this._maxLevel = experienceLevels[experienceLevels.length - 1].level
	}

	public static get maxLevel(): number {
		return this._maxLevel
	}

	public static getCharacterLevel(experience: number): number {
		let level = 0

		for (let i = 0; i < this.experienceLevels.length; i++) {
			const exp = this.experienceLevels[i].experience

			if (experience >= exp) {
				level = this.experienceLevels[i].level
			}
		}

		return level
	}

  public static getCharacterExperienceLevelFloor(level: number): number {
    return this.experienceLevels[level].experience
  }

  public static getCharacterExperienceNextLevelFloor(level: number): number {
    return this.experienceLevels[level + 1].experience
  }
}

export default Experience
