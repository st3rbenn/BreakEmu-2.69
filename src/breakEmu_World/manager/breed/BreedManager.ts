import Breed from "../../../breakEmu_API/model/breed.model"
import Character from "../../../breakEmu_API/model/character.model"
import Head from "../../../breakEmu_API/model/head.model"
import ContextEntityLook from "../entities/look/ContextEntityLook"

class BreedManager {
	private static _instance: BreedManager
	private _breeds: Breed[] = []

	public static _breedDefaultLife: number = 55
	public static _breedDefaultProspection: number = 100

	public static getInstance(): BreedManager {
		if (!BreedManager._instance) {
			BreedManager._instance = new BreedManager()
		}

		return BreedManager._instance
	}

	public get breeds(): Breed[] {
		return this._breeds
	}

	public getBreedLook(
		breedId: number,
		sex: boolean,
		cosmeticId: number,
		colors: number[],
		skins?: number[]
	): ContextEntityLook {
		const breed = this.getBreedById(breedId)
		const look = sex
			? ContextEntityLook.parseFromString(breed.femaleLook)
			: ContextEntityLook.parseFromString(breed.maleLook)

		if (skins) {
			look.skins.push(...skins)
		} else {
			look.skins.push(parseInt(Head.getSkinById(cosmeticId)))
		}

		look.indexedColors.push(...colors)

		return look
	}

	public getBreedById(id: number): Breed {
		return this._breeds.find((b) => b.id === id) as Breed
	}

	public async learnBreedSpells(character: Character) {
		await character.learnSpell(0, false)
		character.breed.breedSpells.map(async (spellId) => {
			await character.learnSpell(spellId, false)
		})
	}
}

export default BreedManager
