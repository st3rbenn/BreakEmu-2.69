import Character from "../../../breakEmu_API/model/character.model";
import Entity from "../entities/Entity";
import MapElement from "./element/MapElement";
import GameMap from "../../../breakEmu_API/model/map.model";
import InteractiveElementModel from "../../../breakEmu_API/model/InteractiveElement.model";
import interactiveCell from "../../../breakEmu_API/model/InteractiveElement.model";
import {DofusMessage} from "../../../breakEmu_Server/IO";
abstract class MapInstance {
    /*get monsterGroupCount(): number {
        return this.getEntities(MonsterGroup)
    }*/

    private entities: Map<any, Entity> = new Map<any, Entity>()
    private elements: Map<any, MapElement> = new Map<any, MapElement>()

    public mute: boolean = false;

    public record: GameMap

    constructor(map: GameMap) {
        this.record = map
        this.elements = new Map<any, MapElement>()

        /*this.record.elements.forEach((element: InteractiveElementModel) => {
            if(interactiveCell.)
        })*/
    }

    get charactersCount(): number {
        return this.getEntities<Character>(Character).length
    }
    public getEntities<T>(type: { new(...args: any[]): T }): T[] {
        let entities: T[] = []

        this.entities.forEach((entity: Entity) => {
            if (entity instanceof type) {
                entities.push(entity)
            }
        })

        return entities
    }

    public send(message: DofusMessage) {
        for(const player of this.getEntities<Character>(Character)) {
            player.client?.Send(
                player.client?.serialize(
                    message
                )
            )
        }
    }
}

export default MapInstance