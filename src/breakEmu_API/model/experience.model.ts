class Experience {
	level: number
	characterExp: number
	jobExp: number
	guildExp: number
	mountExp: number

	nextLevel: Experience | null = null

	static maxCharacterLevel: number
	static experiences: Map<number, Experience> = new Map()
	static maxJobLevel: number
	static maxGuildLevel: number
	static maxMountLevel: number

	constructor(
		level: number,
		characterExp: number,
		jobExp: number,
		guildExp: number,
		mountExp: number
	) {
		this.level = level
		this.characterExp = characterExp
		this.jobExp = jobExp
		this.guildExp = guildExp
		this.mountExp = mountExp
	}

	public static set experienceLevels(
		experienceLevels: Map<number, Experience>
	) {
		this.experiences = experienceLevels

		// Calculer les niveaux maximaux
		this.calculateMaxLevels()

		// Calculer les niveaux suivants
		this.calculateNextLevels()
	}

	private static calculateMaxLevels() {
		// Réinitialiser les niveaux maximaux
		this.maxCharacterLevel = 0
		this.maxJobLevel = 0
		this.maxGuildLevel = 0
		this.maxMountLevel = 0

		for (const exp of this.experiences.values()) {
			if (exp.characterExp > 0) this.maxCharacterLevel = exp.level
			if (exp.jobExp > 0) this.maxJobLevel = exp.level
			if (exp.guildExp > 0) this.maxGuildLevel = exp.level
			if (exp.mountExp > 0) this.maxMountLevel = exp.level
		}
	}

	private static calculateNextLevels() {
		let previousLevel = null

		for (const exp of this.experiences.values()) {
			if (previousLevel) {
				previousLevel.nextLevel = exp
			}

			previousLevel = exp
		}
	}

	public static getExperienceLevel(level: number): Experience {
		return this.experiences.get(level) as Experience
	}

	public static getCharacterLevel(experience: number): number {
		let level = 1

		// Itérer directement sur les valeurs de la Map sans la convertir en Array
		for (const value of this.experiences.values()) {
			if (experience >= value.characterExp) {
				level = value.level
			}
		}

		return level
	}

	public static getCharacterExperienceLevelFloor(level: number): number {
		const nextLevel = this.experiences.get(level) as Experience
		return nextLevel.characterExp
	}

	public static getCharacterExperienceNextLevelFloor(level: number): number {
		const nextLevel = this.experiences.get(level + 1) as Experience
		return nextLevel.characterExp
	}

	public static getJobLevel(experience: number): number {
		let level = 1

		// Itérer directement sur les valeurs de la Map sans la convertir en Array
		for (const value of this.experiences.values()) {
			if (experience >= value.jobExp) {
				level = value.level
			} else {
        break
      }
		}

		return level
	}

	public static getJobLevelFloor(level: number): number {
		const nextLevel = this.experiences.get(level) as Experience
		return nextLevel.jobExp
	}

	public static getJobLevelNextFloor(level: number): number {
		const nextLevel = this.experiences.get(level + 1) as Experience
		return nextLevel.jobExp
	}
}

export default Experience
