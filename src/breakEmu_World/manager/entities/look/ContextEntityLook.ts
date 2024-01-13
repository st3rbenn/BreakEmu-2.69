import Breed from "../../../../breakEmu_API/model/breed.model"
import { EntityLook, SubEntity } from "../../../../breakEmu_Server/IO"
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
    const lookData = look.split("{")[1].split("}")[0].split("|")
    const bonesId = parseInt(lookData[0])
    const skins = lookData[1].split(",").map(Number)
    const indexedColors: number[] = []
    const scales: number[] = []
    const subEntities: ContextSubEntity[] = []

    if (lookData[2]) {
      const colors = lookData[2].split(",")
      for (const color of colors) {
        const colorData = color.split("=")
        indexedColors[parseInt(colorData[0])] = parseInt(colorData[1])
      }
    }

    if (lookData[3]) {
      scales.push(parseInt(lookData[3]))
    }

    if (lookData[4]) {
      const subEntitiesData = lookData[4].split(",")
      for (const subEntityData of subEntitiesData) {
        const subEntityLook = this.parseFromString(subEntityData.split("=")[1])
        const subEntity = new ContextSubEntity(
          parseInt(subEntityData.split("@")[0]),
          parseInt(subEntityData.split("@")[1].split("=")[0]),
          subEntityLook
        )
        subEntities.push(subEntity)
      }
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

    if(colors.length == 0) {
      return defaultColor
    }

    let num: number = 0
    const verifiedColors: number[] = []

    for (const color of colors) {
      if(defaultColor.length > num) {
        verifiedColors.push(color == -1 ? defaultColor[num] : color)
      }
      num++
    }

    const convertedColors = this.getConvertedColors(verifiedColors)

    return convertedColors
  }

  static getConvertedColors(colors: number[]): number[] {
    const col: number[] = new Array(colors.length);
    for(let i = 0; i < colors.length; i++) {
      const color = colors[i]
      col[i] = (i + 1 << 24) | (color & 16777215)
    }
    return col
  }

	toEntityLook(): EntityLook {
		return new EntityLook(
			this._bonesId,
			this._skins,
			this._indexedColors,
			this._scales,
			this._subentities.map((sub) => sub.toSubEntity())
		)
	}
}

export default ContextEntityLook
