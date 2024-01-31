import MapElement from "./MapElement";
import MapInstance from "../MapInstance";
import InteractiveElementModel from "../../../../breakEmu_API/model/InteractiveElement.model";
import Character from "../../../../breakEmu_API/model/character.model";
import InteractiveSkill from "../../../../breakEmu_API/model/InteractiveSkill.model";
import {InteractiveElement} from "../../../../breakEmu_Server/IO";

class MapInteractiveElement extends MapElement {
    constructor(record: InteractiveElementModel, mapInstance: MapInstance) {
        super(record, mapInstance)
    }

    public getInteractiveElement(character: Character): InteractiveElement {
        let skills: InteractiveSkill[] = []
        //TODO: don't forget to implement here

        return new InteractiveElement()
    }
}

export default MapInteractiveElement;