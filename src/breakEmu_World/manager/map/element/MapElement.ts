import InteractiveElementModel from "../../../../breakEmu_API/model/InteractiveElement.model";
import {GenericActionEnum} from "../../../../breakEmu_Server/IO";
import MapInstance from "../MapInstance";
import Character from "../../../../breakEmu_API/model/character.model";

class MapElement {
    public record: InteractiveElementModel

    public actionIdentifier: GenericActionEnum
    public param1: string
    public param2: string
    public param3: string
    public criteria: string

    public mapInstance: MapInstance

    constructor(record: InteractiveElementModel, mapInstance: MapInstance) {
        this.record = record
        this.mapInstance = mapInstance
    }


    public caneUse(character: Character): boolean {
        return true
    }
}

export default MapElement;