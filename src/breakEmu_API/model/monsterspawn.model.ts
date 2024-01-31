class monsterSpawn {
    private _id: number
    private _monsterId: number
    private _subAreaId: number
    private _probability: number

    private static monsterSpawns: Map<number, monsterSpawn> = new Map<number, monsterSpawn>()

    constructor(
        id: number,
        monsterId: number,
        subAreaId: number,
        probability: number
    ) {
        this._id = id
        this._monsterId = monsterId
        this._subAreaId = subAreaId
        this._probability = probability
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

    get id(): number {
        return this._id;
    }

    get monsterId(): number {
        return this._monsterId;
    }

    get subAreaId(): number {
        return this._subAreaId;
    }

    get probability(): number {
        return this._probability;
    }
}

export default monsterSpawn;