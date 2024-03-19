import monsterSpawn from "./monsterspawn.model"
import MonsterspawnModel from "./monsterspawn.model"

class SubArea {
	id: number
	name: string
	areaId: number
	level: number
	monsterIds: number[]
	questsIds: number[]
	npcIds: number[]
	associatedZaapMapId: number

	private monsterSpawns: Map<number, monsterSpawn> = new Map<
		number,
		monsterSpawn
	>()

	constructor(
		id: number,
		name: string,
		areaId: number,
		level: number,
		monsterIds: number[],
		questsIds: number[],
		npcIds: number[],
		associatedZaapMapId: number
	) {
		this.id = id
		this.name = name
		this.areaId = areaId
		this.level = level
		this.monsterIds = monsterIds
		this.questsIds = questsIds
		this.npcIds = npcIds
		this.associatedZaapMapId = associatedZaapMapId

		this.monsterSpawns = new Map<number, monsterSpawn>()

		MonsterspawnModel.getMonsterSpawns(this.id).forEach(
			(monsterSpawn: monsterSpawn) => {
				this.monsterSpawns.set(monsterSpawn.id, monsterSpawn)
			}
		)
	}
}

export default SubArea
