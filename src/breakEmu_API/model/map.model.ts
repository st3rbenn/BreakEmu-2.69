import Cell from "../../breakEmu_World/manager/map/cell/Cell"
import SubArea from "./SubArea.model";
import InteractiveElementModel from "./InteractiveElement.model";
import MapInstance from "../../breakEmu_World/manager/map/MapInstance";

class GameMap {
    private _id: number
    private _subareaId: number
    private _version: number
    //TODO: implement Class SubArea
    private _subArea: SubArea
    //TODO: implement Class MapInstance
    private _instance: MapInstance

    private _leftMap: number
    private _rightMap: number
    private _topMap: number
    private _bottomMap: number

    private _cells: Map<number, Cell> = new Map<number, Cell>()
    private _elements: Map<number, InteractiveElementModel> = new Map<number, InteractiveElementModel>()

    private static maps: Map<number, GameMap> = new Map<number, GameMap>()

    constructor(id: number, subareaId: number, version: number, leftMap: number, rightMap: number, topMap: number, bottomMap: number) {
        this._id = id
        this._subareaId = subareaId
        this._version = version
        this._leftMap = leftMap
        this._rightMap = rightMap
        this._topMap = topMap
        this._bottomMap = bottomMap
    }

    get id(): number {
        return this._id;
    }

    get subareaId(): number {
        return this._subareaId;
    }

    get version(): number {
        return this._version;
    }

    get subArea(): SubArea {
        return this._subArea;
    }

    get instance(): any {
        return this._instance;
    }

    get leftMap(): number {
        return this._leftMap;
    }

    get rightMap(): number {
        return this._rightMap;
    }

    get topMap(): number {
        return this._topMap;
    }

    get bottomMap(): number {
        return this._bottomMap;
    }

    get cells(): Map<number, Cell>{
        return this._cells;
    }

    set cells(value: Map<number, Cell>){
        this._cells = value;
    }

    get elements(): Map<number, InteractiveElementModel>{
        return this._elements;
    }

    static getMapById(id: number): GameMap | undefined {
        return GameMap.maps.get(id)
    }


    public save(): MapData {
        return {
            id: this.id,
            subareaId: this.subareaId,
            version: this.version,
            leftMap: this.leftMap,
            rightMap: this.rightMap,
            topMap: this.topMap,
            bottomMap: this.bottomMap,
            cells: this.saveCells(),
            elements: this.saveElements()
        }
    }

    public saveCells(): string {
        let cells: CellData[] = []
        this.cells.forEach((cell) => {
            cells.push(cell.save())
        })
        return JSON.stringify(cells)
    }

    public saveElements(): string {
        let elements: InteractiveElementData[] = []
        this.elements.forEach((element) => {
            elements.push(element.save())
        })
        return JSON.stringify(elements)
    }
}

export interface CellData {
    id: number
    blue: boolean
    red: boolean
    losMov: number
    mapChangeData: number
}

export interface InteractiveElementData {
    elementId: number
    cellId: number
    mapId: number
    gfxId: number
    bonesId: number
}

export interface MapData {
    id: number
    subareaId: number
    version: number
    leftMap: number
    rightMap: number
    topMap: number
    bottomMap: number
    cells: string
    elements: string
}

export default GameMap