import Breed from "@breakEmu_API/model/breed.model"
import { EntityLook, SubEntity } from "@breakEmu_Protocol/IO"
import ContextSubEntity from "./ContextSubEntity"

class ContextEntityLook {
	private _bonesId: number
	private _skins: number[]
	private _indexedColors: number[]
	private _scales: number[]
	private _subentities: ContextSubEntity[]

	constructor(
		bonesId: number,
		skins: number[],
		indexedColors: number[],
		scales: number[],
		subentities: ContextSubEntity[]
	) {
		this._bonesId = bonesId
		this._skins = skins
		this._indexedColors = indexedColors
		this._scales = scales
		this._subentities = subentities
	}

	public get actorLook(): ContextEntityLook {
		return this
	}

	public get bonesId(): number {
		return this._bonesId
	}

	public get skins(): number[] {
		return this._skins
	}

	public get indexedColors(): number[] {
		return this._indexedColors
	}

	public get scales(): number[] {
		return this._scales
	}

	public get subentities(): ContextSubEntity[] {
		return this._subentities
	}

	static convertToString(look: ContextEntityLook): string {
		const stringBuilder: string[] = []
		stringBuilder.push("{")
		let num = 0

		stringBuilder.push(look.bonesId?.toString())

		if (!look.skins || look.skins.length === 0) {
			num++
		} else {
			stringBuilder.push("|".repeat(num + 1))
			num = 0
			stringBuilder.push(look.skins.join(","))
		}

		if (!look.indexedColors) {
			num++
		} else {
			stringBuilder.push("|".repeat(num + 1))
			num = 0

			const values: string[] = []
			let i = 0

			for (const key in look.indexedColors) {
				if (look.indexedColors.hasOwnProperty(key)) {
					i++
					values.push(i + "=" + look.indexedColors[key])
				}
			}

			stringBuilder.push(values.join(","))
		}

		if (!look.scales) {
			num++
		} else {
			stringBuilder.push("|".repeat(num + 1))
			num = 0
			stringBuilder.push(look.scales.join(","))
		}

		if (look.subentities !== undefined && look.subentities.length <= 0) {
			num++
		} else {
			const subEntitiesAsString: string[] = []

			for (const sub of look.subentities) {
				const subBuilder: string[] = []
				subBuilder.push(sub.bindingPointCategory.toString())
				subBuilder.push("@")
				subBuilder.push(sub.bindingPointIndex.toString())
				subBuilder.push("=")
				subBuilder.push(this.convertToString(sub.subEntityLook))
				subEntitiesAsString.push(subBuilder.join(""))
			}

			stringBuilder.push("|".repeat(num + 1))
			stringBuilder.push(subEntitiesAsString.join(","))
		}

		stringBuilder.push("}")
		return stringBuilder.join("")
	}

	static parseFromString(look: string): ContextEntityLook {
		const lookData = look.length > 1 ? look.split("{")[1].split("}")[0].split("|") : []
		const bonesId = parseInt(lookData[0])
		const indexedColors: number[] = []
		const scales: number[] = []
		const subEntities: ContextSubEntity[] = []
		let skins: number[] = []

		if (lookData[1]) {
			skins = lookData[1].split(",").map(Number)
		}

		if (lookData[2]) {
			lookData[2].split(",").forEach((color) => {
				if (color) {
					indexedColors.push(parseInt(color.split("=")[1]))
				}
			})
		}

		if (lookData[3]) {
			scales.push(parseInt(lookData[3]))
		}

		if (lookData[4]) {
			lookData[4].split(",").forEach((subEntityData) => {
				const [idAt, lookStr] = subEntityData.split("=")
				const [id, type] = idAt.split("@").map(Number)
				const subEntityLook = this.parseFromString(lookStr)
				const subEntity = new ContextSubEntity(id, type, subEntityLook)
				subEntities.push(subEntity)
			})
		}

		return new ContextEntityLook(
			bonesId,
			skins,
			indexedColors,
			scales,
			subEntities
		)
	}

	static verifyColors(colors: number[], sex: boolean, breed: Breed) {
		const defaultColor: number[] = sex ? breed.femaleColors : breed.maleColors

		if (colors.length == 0) {
			return defaultColor
		}

		let num: number = 0
		const verifiedColors: number[] = []

		for (const color of colors) {
			if (defaultColor.length > num) {
				verifiedColors.push(color == -1 ? defaultColor[num] : color)
			}
			num++
		}

		const convertedColors = this.getConvertedColors(verifiedColors)

		return convertedColors
	}

	static getConvertedColors(colors: number[]): number[] {
		const col: number[] = new Array(colors.length)
		for (let i = 0; i < colors.length; i++) {
			const color = colors[i]
			col[i] = ((i + 1) << 24) | (color & 16777215)
		}
		return col
	}

	public toEntityLook(): EntityLook {
		return new EntityLook(
			this._bonesId,
			this._skins,
			this._indexedColors,
			this._scales,
			this._subentities.map((sub) => sub.toSubEntity())
		)
	}

	public addSkin(skinId: number) {
		const look = this.actorLook
		if (!look.skins.includes(skinId)) {
			look.skins.push(skinId)
		}
	}

	public removeSkin(skinId: number) {
		const look = this.actorLook
		if (look.skins.includes(skinId)) {
			look.skins.splice(look.skins.indexOf(skinId), 1)
		}
	}
}

export default ContextEntityLook
