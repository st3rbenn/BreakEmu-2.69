import {
	GenericActionEnum,
	InteractiveTypeEnum,
	SkillTypeEnum,
} from "../../breakEmu_Server/IO"
import Skill from "./skill.model"

class InteractiveSkill {
	private _id: number
	private _mapId: number
	private _identifier: number
	private _actionIdentifier: number
	private _type: number
	private _skillId: number

	private _record: Skill
	private _param1: string
	private _param2: string
	private _param3: string
	private _criteria: string

	static interactiveSkills: Map<number, InteractiveSkill> = new Map<
		number,
		InteractiveSkill
	>()

	constructor(
		id: number,
		mapId: number,
		identifier: number,
		actionIdentifier: string,
		type: string,
		skillId: string,
		param1: string,
		param2: string,
		param3: string,
		criteria: string
	) {
		this._id = id
		this._mapId = mapId
		this._identifier = identifier
		this._actionIdentifier = this.extractNumberFromEnumKey(
			actionIdentifier,
			GenericActionEnum as any
		) as number
		this._skillId = this.extractNumberFromEnumKey(
			skillId,
			SkillTypeEnum as any
		) as number
		this._type = this.extractNumberFromEnumKey(
			type,
			InteractiveTypeEnum as any
		) as number
		this._param1 = param1
		this._param2 = param2
		this._param3 = param3
		this._criteria = criteria

		this._record = Skill.getSkill(this.skillId) as Skill
	}

	get id(): number {
		return this._id
	}

	get mapId(): number {
		return this._mapId
	}

	get identifier(): number {
		return this._identifier
	}

	get actionIdentifier(): GenericActionEnum {
		return this._actionIdentifier
	}

	get type(): InteractiveTypeEnum {
		return this._type
	}

	get skillId(): SkillTypeEnum {
		return this._skillId
	}

	get record(): Skill {
		return this._record
	}

	get param1(): string {
		return this._param1
	}

	get param2(): string {
		return this._param2
	}

	get param3(): string {
		return this._param3
	}

	get criteria(): string {
		return this._criteria
	}

	extractNumberFromEnumKey<T extends Record<string, number>>(
		key: string,
		test: T
	): number | null {
		// Convertit l'énumération en un tableau de clés
		const enumKeys = Object.keys(test)

		// Trouve la première clé qui inclut la chaîne de caractères spécifiée
		const matchingKey = enumKeys.find((enumKey) => enumKey.includes(key))

		// Si aucune clé correspondante n'est trouvée, renvoie null
		if (!matchingKey) {
			// console.log(`La clé ${key} n'a pas été trouvée dans l'énumération`)
			return null
		}

		// Renvoie la valeur associée à la clé trouvée
    //@ts-ignore
    if(test[matchingKey] === "ELM30") {
      return 30
    }


		return test[matchingKey]
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

export default InteractiveSkill
