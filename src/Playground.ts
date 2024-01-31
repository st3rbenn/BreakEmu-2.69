import {genSaltSync, hashSync} from "bcrypt"
import Logger from "./breakEmu_Core/Logger"
import {Socket} from "net"
import ConnectionQueue from "./breakEmu_Auth/ConnectionQueue"
import Database from "./breakEmu_API/Database"
import * as fs from "fs"
import {ansiColorCodes} from "./breakEmu_Core/Colors"
import * as path from "node:path";
import GameMap from "./breakEmu_API/model/map.model";
import Cell from "./breakEmu_World/manager/map/cell/Cell";
import InteractiveElementModel from "./breakEmu_API/model/InteractiveElement.model";

interface BreedRoles {
    breedId: number
    roleId: number
    descriptionId: number
    value: number
    order: number
}

interface Breed {
    id: number
    maleLook: string
    femaleLook: string
    creatureBonesId: number
    maleArtwork: string
    femaleArtwork: string
    statsPointsForStrength: number[][]
    statsPointsForIntelligence: number[][]
    statsPointsForChance: number[][]
    statsPointsForAgility: number[][]
    statsPointsForVitality: number[][]
    statsPointsForWisdom: number[][]
    breedSpellsId: number[]
    breedRoles: BreedRoles[]
    maleColors: number[]
    femaleColors: number[]
    spawnMap: number
    complexity: number
    sortIndex: number
}

interface DungeonsFile {
    id: number
    name: string
    mapIds: number[]
    entranceMapId: number
    exitMapId: number
    optimalPlayerLevel: number
}

interface Exp {
    level: number
    experiencePoints: number
}

interface Head {
    skins: string
    assetId: string
    breed: number
    gender: number
    label: string
    order: number
}

interface Skills {
    id: number
    name: string
    parentJobId: number
    gatheredRessourceItem: number
    interactiveId: number
    levelMin: number
}

interface Spell {
    id: number
    name: string | number
    description: string | number
    spellLevels: number[]
    verboseCast: boolean
}

interface Effects {
    targetMask: string
    diceNum: number
    visibleInBuffUi: boolean
    baseEffectId: number
    visibleInFightLog: boolean
    targetId: number
    effectElement: number
    effectUid: number
    dispellable: number
    triggers: string
    spellId: number
    duration: number
    random: number
    effectId: number
    delay: number
    diceSide: number
    visibleOnTerrain: boolean
    visibleInTooltip: boolean
    rawZone: string
    forClientOnly: boolean
    value: number
    order: number
    group: number
}

interface Item {
    Id: number
    Name: string
    typeId: number
    level: number
    realWeight: number
    cursed: boolean
    usable: boolean
    exchangeable: boolean
    price: number
    etheral: boolean
    itemSetId: number
    criteria: string
    AppearenceId: number
    dropMonsterIds: number[]
    recipeSlots: number
    recipeIds: number[]
    possibleEffects: Effects[]
    craftXpRatio: number
    isSaleable: boolean
    look: string
}

interface ItemSet {
    id: number
    items: number[]
    name: string
    bonusIsSecret: boolean
    effects: Effects[][]
}

interface weapon {
    id: number
    name: string
    typeId: number
    level: number
    realWeight: number
    cursed: boolean
    usable: boolean
    exchangeable: boolean
    price: number
    etheral: boolean
    itemSetId: number
    criteria: string
    appearanceId: number
    dropMonsterIds: number[]
    recipeSlots: number
    recipeIds: number[]
    possibleEffects: Effects[]
    craftXpRatio: number
    isSaleable: boolean
    apCost: number
    minRange: number
    range: number
    maxCastPerTurn: number
    castInLine: boolean
    castInDiagonal: boolean
    castTestLos: boolean
    criticalHitProbability: number
    criticalHitBonus: number
}

interface SpellLevel {
    id: number
    spellId: number
    grade: number
    spellBreed: number
    apCost: number
    minRange: number
    range: number
    castInLine: boolean
    castInDiagonal: boolean
    castTestLos: boolean
    criticalHitProbability: number
    needFreeCell: boolean
    needTakenCell: boolean
    needVisibleEntity: boolean
    needCellWithoutPortal: boolean
    portalProjectionForbidden: boolean
    needFreeTrapCell: boolean
    rangeCanBeBoosted: boolean
    maxStack: number
    maxCastPerTurn: number
    maxCastPerTarget: number
    minCastInterval: number
    initialCooldown: number
    globalCooldown: number
    minPlayerLevel: number
    hideEffects: boolean
    hidden: boolean
    playAnimation: boolean
    statesCriterion: string
    effects: Effects[]
    criticalEffect: Effects[]
}

interface SpellVariant {
    id: number
    breedId: number
    spellIds: number[]
}

interface FinishMove {
    id: number
    duration: number
    free: boolean
    name: string
    category: number
    spellLevel: number
}

interface Cells {
    floor: number
    mov: boolean
    nonWalkableDuringFight: boolean
    nonWalkableDuringRP: boolean
    los: boolean
    blue: boolean
    red: boolean
    visible: boolean
    farmCell: boolean
    havenbagCell: boolean
    speed: number
    mapChangeData: number
    moveZone: number
}

interface Map {
    mapId: number
    subareaId: number
    topNeighbourId: number
    bottomNeighbourId: number
    leftNeighbourId: number
    rightNeighbourId: number
    mapVersion: number
    layers: Layer[]
    cellsCount: number
    cells: Cells[]
}

interface Layer {
    layerId: number
    cellsCount: number
    cells: LayerCell[]
}

interface LayerCell {
    cellId: number
    elementsCount: number
    elements: Element[]
}

interface Element {
    elementName: string
    elementId: number
    hue_1: number
    hue_2: number
    hue_3: number
    shadow_1: number
    shadow_2: number
    shadow_3: number
    offsetX: number
    offsetY: number
    altitude: number
    identifier: number
}

interface InteractiveSkill {
    Id: string
    MapId: string
    Identifier: string
    ActionIdentifier: string
    Type: string
    SkillId: string
    Param1: string
    Param2: string
    Param3: string
    Criteria: string
}

interface SubArea {
    id: number
    nameId: string
    areaId: number
    level: number
    monsters: number[]
    quests: number[]
    npcs: number[]
    associatedZaapMapId: number
}

interface monsterSpawn {
    Id: string
    MonsterId: string
    SubareaId: string
    Probability: string
}

interface interactiveElement {
    UId: string
    ElementId: string
    MapId: string
    CellId: string
    ElementType: string
    GfxId: string
    GfxBonesId: string
}

class Playground {
    public logger: Logger = new Logger("Playground")
    public database: Database = Database.getInstance()

    messageId: number = 0

    public async main(): Promise<void> {
        /**
         * Generate Password ⬇
         * const salt = genSaltSync(10)
         * const hash = hashSync("admin", salt)
         * this.logger.write(hash)
         */
        /**
         * Test the queueing system
         * need to create a new socket for each connection
         * need to be updated i guess
         */
        // const arrayOfSocket: Socket[] = []

        // const socket = new Socket({
        // 	readable: true,
        // 	writable: true,
        // 	allowHalfOpen: false,
        // })

        // for (let i = 0; i < 10; i++) {
        // 	arrayOfSocket.push(socket)
        // }

        // await this.sendDataWithVariableDelay(arrayOfSocket, 50)

        /**
         * hydrate database.
         */

        // if (mapVersion >= 9)
        // {
        //     Losmov = (Mov ? 0 : 1) | (NonWalkableDuringFight ? 2 : 0) | (NonWalkableDuringRP ? 4 : 0) |
        //         (Los ? 0 : 8) | (Blue ? 16 : 0) | (Red ? 32 : 0) | (Visible ? 64 : 0) | (FarmCell ? 128 : 0);

        //     if (mapVersion >= 10)
        //     {
        //         Losmov |= (HavenBagCell ? 256 : 0);
        //     }
        // }

        /*await this.database.prisma.interactiveElement.create({
            data: {
                id: parseInt(monsterspawn.UId),
                elementId: parseInt(monsterspawn.ElementId),
                mapId: parseInt(monsterspawn.MapId),
                elementType: parseInt(monsterspawn.ElementType),
                gfxId: parseInt(monsterspawn.GfxId),
                bonesId: parseInt(monsterspawn.GfxBonesId),
                cellId: parseInt(monsterspawn.CellId),
            }
        })*/

        try {
            await this.database.loadInteractiveElements()
            const folderPath = 'src/breakEmu_API/data/output'; // Chemin vers le dossier contenant les fichiers JSON
            const files = fs.readdirSync(folderPath);

            // Filtre pour ne traiter que les fichiers .json
            const jsonFiles = files.filter(file => path.extname(file) === '.json');

            for (const fileName of jsonFiles) {
                const filePath = path.join(folderPath, fileName); // Construit le chemin complet du fichier
                const jsonFile = fs.readFileSync(filePath, 'utf8'); // Lit le contenu du fichier
                const data = JSON.parse(jsonFile) as Map// Parse le JSON

                // Ici, vous pouvez traiter chaque objet JSON comme vous le faisiez auparavant




                const gameMap = new GameMap(
                    data.mapId,
                    data.subareaId,
                    data.mapVersion,
                    data.leftNeighbourId,
                    data.rightNeighbourId,
                    data.topNeighbourId,
                    data.bottomNeighbourId
                )

                let cells = new Map<number, Cell>()

                for (let i = 0; i < data.cellsCount; i++) {
                    let losMov = 0

                    if (data.mapVersion >= 9)
                    {
                        losMov = (data.cells[i].mov ? 0 : 1) | (data.cells[i].nonWalkableDuringFight ? 2 : 0) | (data.cells[i].nonWalkableDuringRP ? 4 : 0) |
                            (data.cells[i].los ? 0 : 8) | (data.cells[i].blue ? 16 : 0) | (data.cells[i].red ? 32 : 0) | (data.cells[i].visible ? 64 : 0) | (data.cells[i].farmCell ? 128 : 0);

                        if (data.mapVersion >= 10)
                        {
                            losMov |= (data.cells[i].havenbagCell ? 256 : 0);
                        }
                    }



                    const c = new Cell(
                        i,
                        data.cells[i].blue,
                        data.cells[i].red,
                        losMov,
                        data.cells[i].mapChangeData
                    )

                    cells.set(i, c)
                }

                gameMap.cells = cells


                InteractiveElementModel.interactiveCells.forEach((interactiveElement) => {
                    if(interactiveElement.mapId === gameMap.id) {
                        gameMap.elements.set(interactiveElement.identifier, interactiveElement)
                    }
                })

                await this.logger.writeAsync(
                    `Add -> ${gameMap.id}`,
                    ansiColorCodes.bgMagenta
                );

                const mapData = gameMap.save()

                await this.database.prisma.map.create({
                    data: {
                        id: mapData.id,
                        subAreaId: mapData.subareaId,
                        version: mapData.version,
                        leftNeighbourId: mapData.leftMap,
                        rightNeighbourId: mapData.rightMap,
                        topNeighbourId: mapData.topMap,
                        bottomNeighbourId: mapData.bottomMap,
                        cells: mapData.cells,
                        elements: mapData.elements
                    }
                })

                break;
            }

            console.log("Done");
        } catch (error) {
            await this.logger.writeAsync(`Error: ${error}`, ansiColorCodes.bgRed);
        }

        /*try {
            const jsonFileName: string = "interactiveelements"
            const jsonFile = this.readJsonFile(jsonFileName)
            const data = JSON.parse(jsonFile) as Map[]

            for (const monsterspawn of data) {
                await this.logger.writeAsync(
                    `Add ${jsonFileName} -> ${monsterspawn.mapId}`,
                    ansiColorCodes.bgMagenta
                )



            }

            console.log("Done")
        } catch (error) {
            await this.logger.writeAsync(`Error: ${error}`, ansiColorCodes.bgRed)
        }*/

        process.exit(0)
    }

    async sendDataWithVariableDelay<D>(
        data: D[],
        startDelay: number
    ): Promise<void> {
        for (let i = 0; i < data.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, startDelay))
            await ConnectionQueue.getInstance().enqueue(data[i] as Socket)
        }
    }

    readJsonFile(fileName: string): string {
        return fs.readFileSync(`./src/breakEmu_API/data/${fileName}.json`, "utf-8")
    }

    parseStatsPoints(statsPoints: number[][]): string {
        return statsPoints.map((sp) => sp.join(",")).join("|")
    }
}

new Playground().main()
