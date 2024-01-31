import {GenericActionEnum, InteractiveTypeEnum, SkillTypeEnum} from "../../breakEmu_Server/IO";
import Skill from "./skill.model";
import {type} from "node:os";

class InteractiveSkill {
    private _id: number
    private _mapId: number
    private _identifier: number
    private _actionIdentifier: GenericActionEnum
    private _type: InteractiveTypeEnum
    private _skillId: SkillTypeEnum

    private _record: Skill
    private _param1: string
    private _param2: string
    private _param3: string
    private _criteria: string

    static interactiveSkills: Map<number, InteractiveSkill> = new Map<number, InteractiveSkill>()

    constructor(id: number,
                mapId: number,
                identifier: number,
                actionIdentifier: string,
                type: string,
                skillId: string,
                param1: string,
                param2: string,
                param3: string,
                criteria: string) {
        this._id = id
        this._mapId = mapId
        this._identifier = identifier
        this._actionIdentifier = GenericActionEnum[actionIdentifier as keyof typeof GenericActionEnum]
        this._type = InteractiveTypeEnum[type as keyof typeof InteractiveTypeEnum]
        this._skillId = SkillTypeEnum[skillId as keyof typeof SkillTypeEnum]
        this._param1 = param1
        this._param2 = param2
        this._param3 = param3
        this._criteria = criteria
    }

    get id(): number {
        return this._id;
    }

    get mapId(): number {
        return this._mapId;
    }

    get identifier(): number {
        return this._identifier;
    }

    get actionIdentifier(): GenericActionEnum {
        return this._actionIdentifier;
    }

    get type(): InteractiveTypeEnum {
        return this._type;
    }

    get skillId(): SkillTypeEnum {
        return this._skillId;
    }

    get record(): Skill {
        return this._record;
    }

    get param1(): string {
        return this._param1;
    }

    get param2(): string {
        return this._param2;
    }

    get param3(): string {
        return this._param3;
    }

    get criteria(): string {
        return this._criteria;
    }

    public static getInteractiveSkills(): Map<number, InteractiveSkill> {
        return this.interactiveSkills
    }

    public static getInteractiveSkill(id: number): InteractiveSkill | undefined {
        return this.interactiveSkills.get(id)
    }

    public static addInteractiveSkill(interactiveSkill: InteractiveSkill): void {
        this.interactiveSkills.set(interactiveSkill.id, interactiveSkill)
    }
}

export default InteractiveSkill;