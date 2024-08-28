import WorldServerData from "@breakEmu_World/WorldServerData"

class World {
	id: number
	name: string
	port: number
	address: string
	requireSubscription: boolean
	completion: number
	serverSelectable: boolean
	charCapacity: number
	charsCount: number
	requiredRole: number
	status: number
	created_at: Date
	updated_at: Date
	deleted_at: Date | null

	private static _Worlds: World[] = []

	constructor(
		id: number,
		name: string,
		port: number,
		address: string,
		requireSubscription: boolean,
		completion: number,
		serverSelectable: boolean,
		charCapacity: number,
		charsCount: number,
		requiredRole: number,
		status: number,
		created_at: Date,
		updated_at: Date,
		deleted_at: Date | null
	) {
		this.id = id
		this.name = name
		this.port = port
		this.address = address
		this.requireSubscription = requireSubscription
		this.completion = completion
		this.serverSelectable = serverSelectable
		this.charCapacity = charCapacity
		this.charsCount = charsCount
		this.requiredRole = requiredRole
		this.status = status
		this.created_at = created_at
		this.updated_at = updated_at
		this.deleted_at = deleted_at
	}

	public static get worlds(): World[] {
		return this._Worlds
	}

	public static set worlds(worlds: World[]) {
		this._Worlds = worlds
	}

	public toWorldServerData(): WorldServerData {
		return new WorldServerData(
			this.id,
			this.address,
			this.port,
			this.name,
			this.charCapacity,
			this.requiredRole,
			false,
			this.serverSelectable,
			this.requireSubscription
		)
	}
}

export default World
