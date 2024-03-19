class monsterSpawn {
	id: number
	monsterId: number
	subAreaId: number
	probability: number

	private static monsterSpawns: Map<number, monsterSpawn> = new Map<
		number,
		monsterSpawn
	>()

	constructor(
		id: number,
		monsterId: number,
		subAreaId: number,
		probability: number
	) {
		this.id = id
		this.monsterId = monsterId
		this.subAreaId = subAreaId
		this.probability = probability
	}

	static getMonsterSpawn(id: number): monsterSpawn | undefined {
		return this.monsterSpawns.get(id)
	}

	static getMonsterSpawns(subAreaId: number): monsterSpawn[] {
		let monsterSpawns: monsterSpawn[] = []

		this.monsterSpawns.forEach((monsterSpawn: monsterSpawn) => {
			if (monsterSpawn.subAreaId === subAreaId) {
				monsterSpawns.push(monsterSpawn)
			}
		})

		return monsterSpawns
	}
}

export default monsterSpawn
