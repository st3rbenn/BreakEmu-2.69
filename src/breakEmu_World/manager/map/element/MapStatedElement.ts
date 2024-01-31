import MapInteractiveElement from "./MapInteractiveElement";
import Character from "../../../../breakEmu_API/model/character.model";
import InteractiveSkill from "../../../../breakEmu_API/model/InteractiveSkill.model";
import {StatedElement, StatedElementState, StatedElementUpdatedMessage} from "../../../../breakEmu_Server/IO";
import InteractiveElementModel from "../../../../breakEmu_API/model/InteractiveElement.model";
import MapInstance from "../MapInstance";
import Job from "../../../../breakEmu_API/model/job.model";

class MapStatedElement extends MapInteractiveElement {
    private _GROW_INTERVAL: number = 120

    private _character: Character
    private _skill: InteractiveSkill

    private _state: StatedElementState

    constructor(record: InteractiveElementModel, mapInstance: MapInstance) {
        super(record, mapInstance)
    }

    public getStatedElement(): StatedElement {
        return new StatedElement(
            this.record.identifier,
            this.record.cellId,
            this.state,
            true
        )
    }

    private updateState(state: StatedElementState) {
        this.state = state
        this.mapInstance.send(new StatedElementUpdatedMessage(this.getStatedElement()))
    }

    public use(character: Character) {
        //TODO: implement USE action
        /*this.character = character

        const job: Job = character.job*/
    }

    public grow() {
        if(this.state == StatedElementState.Unactive) {
            this.updateState(StatedElementState.Active)
        }
    }

    public override caneUse(character: Character): boolean {
        return super.caneUse(character) && this.state == StatedElementState.Active
    }


    get GROW_INTERVAL(): number {
        return this._GROW_INTERVAL;
    }

    get character(): Character {
        return this._character;
    }

    get skill(): InteractiveSkill {
        return this._skill;
    }

    get state(): StatedElementState {
        return this._state;
    }

    set state(value: StatedElementState) {
        this._state = value;
    }
}

export default MapStatedElement;