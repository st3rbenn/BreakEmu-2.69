import ContextEntityLook from "../../breakEmu_World/model/entities/look/ContextEntityLook"
import Head from "./head.model"

class Breed {
	private _id: number
	private _name: string
	private _maleLook: string
	private _femaleLook: string
	private _maleColors: number[]
	private _femaleColors: number[]
	private _spForIntelligence: string
	private _spForAgility: string
	private _spForStrength: string
	private _spForVitality: string
	private _spForWisdom: string
	private _spForChance: string
	private _startLifePoints: number

	private static _Breeds: Breed[] = []

	constructor(
		id: number,
		name: string,
		maleLook: string,
		femaleLook: string,
		maleColors: string,
		femaleColors: string,
		spForIntelligence: string,
		spForAgility: string,
		spForStrength: string,
		spForVitality: string,
		spForWisdom: string,
		spForChance: string,
		startLifePoints: number
	) {
		this._id = id
		this._name = name
		this._maleLook = maleLook
		this._femaleLook = femaleLook
		this._maleColors = maleColors.split(",").map(Number)
		this._femaleColors = femaleColors.split(",").map(Number)
		this._spForIntelligence = spForIntelligence
		this._spForAgility = spForAgility
		this._spForStrength = spForStrength
		this._spForVitality = spForVitality
		this._spForWisdom = spForWisdom
		this._spForChance = spForChance
		this._startLifePoints = startLifePoints
	}

	public get id(): number {
		return this._id
	}

	public get name(): string {
		return this._name
	}

	public get maleLook(): string {
		return this._maleLook
	}

	public get femaleLook(): string {
		return this._femaleLook
	}

	public get maleColors(): number[] {
		return this._maleColors
	}

	public get femaleColors(): number[] {
		return this._femaleColors
	}

	public get spForIntelligence(): string {
		return this._spForIntelligence
	}

	public get spForAgility(): string {
		return this._spForAgility
	}

	public get spForStrength(): string {
		return this._spForStrength
	}

	public get spForVitality(): string {
		return this._spForVitality
	}

	public get spForWisdom(): string {
		return this._spForWisdom
	}

	public get spForChance(): string {
		return this._spForChance
	}

	public get startLifePoints(): number {
		return this._startLifePoints
	}

	public static get breeds(): Breed[] {
		return Breed._Breeds
	}

	public static set breeds(breeds: Breed[]) {
		Breed._Breeds = breeds
	}

	public static getBreedById(id: number): Breed {
		return Breed.breeds.find((b) => b.id === id) as Breed
	}

	public static getBreedLook(
		breedId: number,
		sex: boolean,
		cosmeticId: number,
		colors: number[]
	): ContextEntityLook {
		const breed = Breed.getBreedById(breedId)
		const look = sex
			? ContextEntityLook.parseFromString(breed.femaleLook)
			: ContextEntityLook.parseFromString(breed.maleLook)

		look.skins.push(parseInt(Head.getSkinById(cosmeticId)))

		look.indexedColors.push(...colors)

		return look
	}
}

export default Breed
