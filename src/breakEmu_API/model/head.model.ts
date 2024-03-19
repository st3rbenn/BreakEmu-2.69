class Head {
	id: number
	skins: string
	assetId: string
	breed: number
	gender: boolean
	label: string
	order: number

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
		this.id = id
		this.skins = skins
		this.assetId = assetId
		this.breed = breed
		this.gender = gender
		this.label = label
		this.order = order
	}

	static get heads(): Head[] {
		return this._Heads
	}

	public static getSkinById(id: number): string {
		return this._Heads.find((h) => h.id === id)?.skins as string
	}
}

export default Head
