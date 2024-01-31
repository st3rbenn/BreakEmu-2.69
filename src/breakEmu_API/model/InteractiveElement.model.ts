import MapPoint from "../../breakEmu_World/manager/map/MapPoint";
import InteractiveSkill from "./InteractiveSkill.model";
import MapElement from "../../breakEmu_World/manager/map/element/MapElement";
import MapInstance from "../../breakEmu_World/manager/map/MapInstance";
import MapInteractiveElement from "../../breakEmu_World/manager/map/element/MapInteractiveElement";
import MapStatedElement from "../../breakEmu_World/manager/map/element/MapStatedElement";
import {InteractiveElementData} from "./map.model";

class InteractiveElementModel {
    private _elementId: number
    private _cellId: number
    private _mapId: number
    private _gfxId: number
    private _bonesId: number

    private _skill: InteractiveSkill

    private _point: MapPoint

    public static interactiveCells: Map<number, InteractiveElementModel> = new Map<number, InteractiveElementModel>()

    constructor(elementId: number, cellId: number, mapId: number, gfxId: number, bonesId: number) {
        this._elementId = elementId
        this._cellId = cellId
        this._mapId = mapId
        this._gfxId = gfxId
        this._bonesId = bonesId

        this._point = new MapPoint(this.cellId)
    }

    public save(): InteractiveElementData {
        return {
            elementId: this._elementId,
            cellId: this._cellId,
            mapId: this._mapId,
            gfxId: this._gfxId,
            bonesId: this._bonesId
        }
    }

    get identifier(): number {
        return this._elementId;
    }

    get cellId(): number {
        return this._cellId;
    }

    get point(): MapPoint {
        return this._point;
    }

    get stated(): boolean {
        return this._bonesId != -1
    }

    get gfxId(): number {
        return this._gfxId;
    }

    get bonesId(): number {
        return this._bonesId;
    }

    get mapId(): number {
        return this._mapId;
    }

    get skill(): InteractiveSkill {
        return this._skill;
    }

    set skill(value: InteractiveSkill) {
        this._skill = value;
    }

    get interactiveCells(): Map<number, InteractiveElementModel> {
        return InteractiveElementModel.interactiveCells;
    }

    public static getInteractiveCell(cellId: number): InteractiveElementModel | undefined {
        return this.interactiveCells.get(cellId)
    }

    public static addInteractiveCell(id: number, interactiveCell: InteractiveElementModel) {
        this.interactiveCells.set(id, interactiveCell)
    }

    public getMapElement(mapInstance: MapInstance): MapElement {
        if(this.stated) {
            return new MapStatedElement(this, mapInstance)
        } else {
            return new MapInteractiveElement(this, mapInstance)
        }
    }
}

export default InteractiveElementModel
