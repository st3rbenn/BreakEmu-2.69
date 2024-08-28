import AchievementManager from "@breakEmu_World/manager/achievement/AchievementManager"
import Achievement from "./achievement.model"
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
	explorationAchievement: Achievement

	static subAreas: Map<number, SubArea> = new Map<number, SubArea>()

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
		associatedZaapMapId: number,
		explorationAchievementId: number | null
	) {
		this.id = id
		this.name = name
		this.areaId = areaId
		this.level = level
		this.monsterIds = monsterIds
		this.questsIds = questsIds
		this.npcIds = npcIds
		this.associatedZaapMapId = associatedZaapMapId
		if (explorationAchievementId) {
			this.explorationAchievement = AchievementManager.achievements.get(
				explorationAchievementId
			) as Achievement
		}

		this.monsterSpawns = new Map<number, monsterSpawn>()

		MonsterspawnModel.getMonsterSpawns(this.id).forEach(
			(monsterSpawn: monsterSpawn) => {
				this.monsterSpawns.set(monsterSpawn.id, monsterSpawn)
			}
		)
	}

	static getSubAreaById(id: number): SubArea {
		return this.subAreas.get(id) as SubArea
	}
}

export default SubArea
