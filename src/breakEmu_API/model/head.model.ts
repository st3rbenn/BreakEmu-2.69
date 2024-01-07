class Head {
	private _id: number
	private _skins: string
	private _assetId: string
	private _breed: number
	private _gender: boolean
	private _label: string
	private _order: number

  private static _Heads: Head[] = []

	constructor(
		id: number,
		skins: string,
		assetId: string,
		breed: number,
		gender: boolean,
		label: string,
		order: number
	) {
		this._id = id
		this._skins = skins
		this._assetId = assetId
		this._breed = breed
		this._gender = gender
		this._label = label
		this._order = order
	}

	public get id(): number {
		return this._id
	}

	public get skins(): string {
		return this._skins
	}

	public get assetId(): string {
		return this._assetId
	}

	public get breed(): number {
		return this._breed
	}

	public get gender(): boolean {
		return this._gender
	}

	public get label(): string {
		return this._label
	}

	public get order(): number {
		return this._order
	}

  static get heads(): Head[] {
    return this._Heads
  }

  public static getSkinById(id: number): string {
    return this._Heads.find((h) => h.id === id)?.skins as string
  }
}

export default Head
