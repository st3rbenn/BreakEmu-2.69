import MapPoint from "../map/MapPoint";
import Map from "../../../breakEmu_API/model/map.model";
import {
    DirectionsEnum,
    DofusMessage,
    GameRolePlayActorInformations,
    GameRolePlayShowActorMessage
} from "../../../breakEmu_Server/IO";

abstract class Entity {
    abstract _id: number
    abstract _name: string
    abstract _cellId: number
    private _point: MapPoint
    private _map: Map | null = null
    abstract _direction: DirectionsEnum

    constructor(map: Map | null) {
        this._map = map
    }

    abstract getActorInformations(): GameRolePlayActorInformations

    public sendMap(message: DofusMessage) {
        if(this.map !== null && this.map.instance !== null) {
            this.map.instance.send(message)
        }
    }

    public refreshActorOnMap() {
        this.sendMap(new GameRolePlayShowActorMessage(this.getActorInformations()));
    }

    get map(): Map | null {
        return this._map;
    }

    set map(value: Map | null) {
        this._map = value;
    }
}

export default Entity