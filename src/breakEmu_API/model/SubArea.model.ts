import monsterSpawn from "./monsterspawn.model";
import MonsterspawnModel from "./monsterspawn.model";

class SubArea {
    private _id: number
    private _name: string
    private _areaId: number
    private _level: number
    private _monsterIds: number[]
    private _questsIds: number[]
    private _npcIds: number[]
    private _associatedZaapMapId: number

    private monsterSpawns: Map<number, monsterSpawn> = new Map<number, monsterSpawn>()

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
        this._id = id
        this._name = name
        this._areaId = areaId
        this._level = level
        this._monsterIds = monsterIds
        this._questsIds = questsIds
        this._npcIds = npcIds
        this._associatedZaapMapId = associatedZaapMapId

        this.monsterSpawns = new Map<number, monsterSpawn>()

        MonsterspawnModel.getMonsterSpawns(this._id).forEach((monsterSpawn: monsterSpawn) => {
            this.monsterSpawns.set(monsterSpawn.id, monsterSpawn)
        })
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get areaId(): number {
        return this._areaId;
    }

    get level(): number {
        return this._level;
    }

    get monsterIds(): number[] {
        return this._monsterIds;
    }

    get questsIds(): number[] {
        return this._questsIds;
    }

    get npcIds(): number[] {
        return this._npcIds;
    }

    get associatedZaapMapId(): number {
        return this._associatedZaapMapId;
    }
}

export default SubArea;