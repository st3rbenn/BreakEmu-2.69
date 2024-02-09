class Experience {
	private _level: number
	private _characterExp: number
  private _jobExp: number
  private _guildExp: number
  private _mountExp: number

	private static _maxLevel: number
	private static _experienceLevels: Experience[] = []

	constructor(level: number, characterExp: number, jobExp: number, guildExp: number, mountExp: number) {
		this._level = level
		this._characterExp = characterExp
    this._jobExp = jobExp
    this._guildExp = guildExp
    this._mountExp = mountExp
	}

	public get level(): number {
		return this._level
	}

	public get characterExperience(): number {
		return this._characterExp
	}

  public get jobExperience(): number {
    return this._jobExp
  }

  public get guildExperience(): number {
    return this._guildExp
  }

  public get mountExperience(): number {
    return this._mountExp
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
			const exp = this.experienceLevels[i].characterExperience

			if (experience >= exp) {
				level = this.experienceLevels[i].level
			}
		}

		return level
	}

  public static getCharacterExperienceLevelFloor(level: number): number {
    return this.experienceLevels[level].characterExperience
  }

  public static getCharacterExperienceNextLevelFloor(level: number): number {
    return this.experienceLevels[level + 1].characterExperience
  }

  public static getJobLevel(experience: number): number {
    let level = 1

    for (let i = 0; i < this.experienceLevels.length; i++) {
      const exp = this.experienceLevels[i].jobExperience

      if (experience >= exp && exp !== 0) {
        level = this.experienceLevels[i].level
      }
    }

    return level
  }

  public static getJobLevelFloor(level: number): number {
    return this.experienceLevels[level].jobExperience
  }
}

export default Experience
