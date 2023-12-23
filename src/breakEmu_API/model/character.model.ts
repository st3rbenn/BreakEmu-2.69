import { EntityLook } from "../../breakEmu_Server/IO"

class Character {
	private _id: number
	private _breed: number
	private _sex: boolean
  private _cosmeticId: number
	private _name: string
  private _colors: number[] = []
	// private _level: number
	// private _look: EntityLook
	// private _experience: number
	// private _mapId: number
	// private _cellId: number
	// private _direction: number
	// private _kamas: number

	constructor(
		id: number,
		breed: number,
		sex: boolean,
    cosmeticId: number,
		name: string,
    colors: number[],
	) {
		this._id = id
		this._breed = breed
		this._sex = sex
    this._cosmeticId = cosmeticId
		this._name = name
    this._colors = colors
		// this._level = level
		// this._look = look
	}

	public get id(): number {
		return this._id
	}

	public get breed(): number {
		return this._breed
	}

	public set breed(breed: number) {
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

  public get colors(): number[] {
    return this._colors
  }

  public set colors(colors: number[]) {
    this._colors = colors
  }

	// public get level(): number {
	// 	return this._level
	// }

	// public set level(level: number) {
	// 	this._level = level
	// }

	// public get look(): EntityLook {
	// 	return this._look
	// }

	// public set look(look: EntityLook) {
	// 	this._look = look
	// }
}

export default Character
