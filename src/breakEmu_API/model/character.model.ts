import {
	ActorExtendedAlignmentInformations,
	CharacterBaseInformations,
	CharacterCharacteristicsInformations,
	CharacterCharacteristic,
	SpellModifierMessage,
} from "../../breakEmu_Server/IO"
import ContextEntityLook from "../../breakEmu_World/model/entities/look/ContextEntityLook"
import Breed from "./breed.model"
import Experience from "./experience.model"
class Character {
	private _id: number
	private _accountId: number
	private _breed: Breed
	private _sex: boolean
	private _cosmeticId: number
	private _name: string
	private _experience: number
	private _look: ContextEntityLook
	private _level: number
	private _mapId: number
	private _cellId: number
	private _direction: number
	private _kamas: number
	private _alignementSide: number
	private _alignementValue: number
	private _alignementGrade: number
	private _characterPower: number
	private _honor: number
	private _dishonor: number
	private _energy: number
	private _aggressable: number

	private static _characters: Character[] = []

	constructor(
		id: number,
		_accountId: number,
		breed: number,
		sex: boolean,
		cosmeticId: number,
		name: string,
		experience: number,
		look: ContextEntityLook,
		mapId: number,
		cellId: number,
		direction: number,
		kamas: number,
		alignmentSide: number,
		alignementValue: number,
		alignementGrade: number,
		characterPower: number,
		honor: number,
		dishonor: number,
		energy: number,
		aggressable: number
	) {
		this._id = id
		this._accountId = _accountId
		this._breed = Breed.breeds.find((b) => b.id === breed) as Breed
		this._sex = sex
		this._cosmeticId = cosmeticId
		this._name = name
		this._experience = experience
		this._level = Experience.getCharacterLevel(this.experience)
		this._look = look
		this._mapId = mapId
		this._cellId = cellId
		this._direction = direction
		this._kamas = kamas
		this._alignementSide = alignmentSide
		this._alignementValue = alignementValue
		this._alignementGrade = alignementGrade
		this._characterPower = characterPower
		this._honor = honor
		this._dishonor = dishonor
		this._energy = energy
		this._aggressable = aggressable
	}

	//#region Getters & Setters

	public get id(): number {
		return this._id
	}

	public get accountId(): number {
		return this._accountId
	}

	public get breed(): Breed {
		return this._breed
	}

	public set breed(breed: Breed) {
		this._breed = breed
	}

	public get sex(): boolean {
		return this._sex
	}

	public set sex(sex: boolean) {
		this._sex = sex
	}

	public get cosmeticId(): number {
		return this._cosmeticId
	}

	public set cosmeticId(cosmeticId: number) {
		this._cosmeticId = cosmeticId
	}

	public get name(): string {
		return this._name
	}

	public set name(name: string) {
		this._name = name
	}

	public get experience(): number {
		return this._experience
	}

	public set experience(experience: number) {
		this._experience = experience
	}

	public static get characters(): Character[] {
		return this._characters
	}

	public static set characters(characters: Character[]) {
		this._characters = characters
	}

	public get look(): ContextEntityLook {
		return this._look
	}

	public set look(look: ContextEntityLook) {
		this._look = look
	}

	public get mapId(): number {
		return this._mapId
	}

	public set mapId(mapId: number) {
		this._mapId = mapId
	}

	public get cellId(): number {
		return this._cellId
	}

	public set cellId(cellId: number) {
		this._cellId = cellId
	}

	public get direction(): number {
		return this._direction
	}

	public set direction(direction: number) {
		this._direction = direction
	}

	public get kamas(): number {
		return this._kamas
	}

	public set kamas(kamas: number) {
		this._kamas = kamas
	}

	public get honor(): number {
		return this._honor
	}

	public set honor(honor: number) {
		this._honor = honor
	}

	public get dishonor(): number {
		return this._dishonor
	}

	public set dishonor(dishonor: number) {
		this._dishonor = dishonor
	}

	public get energy(): number {
		return this._energy
	}

	public set energy(energy: number) {
		this._energy = energy
	}

	public get aggressable(): number {
		return this._aggressable
	}

	public set aggressable(aggressable: number) {
		this._aggressable = aggressable
	}

	public get alignementSide(): number {
		return this._alignementSide
	}

	public set alignementSide(alignementSide: number) {
		this._alignementSide = alignementSide
	}

	public get alignementValue(): number {
		return this._alignementValue
	}

	public set alignementValue(alignementValue: number) {
		this._alignementValue = alignementValue
	}

	public get alignementGrade(): number {
		return this._alignementGrade
	}

	public set alignementGrade(alignementGrade: number) {
		this._alignementGrade = alignementGrade
	}

	public get characterPower(): number {
		return this._characterPower
	}

	public set characterPower(characterPower: number) {
		this._characterPower = characterPower
	}

	public toCharacterBaseInformations(): CharacterBaseInformations {
		return new CharacterBaseInformations(
			this.id,
			this.name,
			this._level,
			this.look.toEntityLook(),
			this.breed.id,
			this.sex
		)
	}

	public ActorExtendedAlignmentInformations() {
		const alignementInfos: ActorExtendedAlignmentInformations = new ActorExtendedAlignmentInformations(
			this.alignementSide,
			this.alignementValue,
			this.alignementGrade,
			this.characterPower,
			this.honor,
			0,
			0,
			this.aggressable
		)

		return alignementInfos
	}

	public characterCharacteristicsInformations() {
		// const charac = new CharacterCharacteristic(1)

		// const spell = new SpellModifierMessage()

		const stats = new CharacterCharacteristicsInformations(
			this.experience,
			Experience.getCharacterExperienceLevelFloor(this._level),
			Experience.getCharacterExperienceNextLevelFloor(this._level),
			0,
			this.kamas,
			this.ActorExtendedAlignmentInformations(),
			[],
			0,
			[],
			0
		)

		return stats
	}
}

export default Character
