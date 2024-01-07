import WorldServerData from "../../breakEmu_World/WorldServerData"

class World {
	private _id: number
	private _name: string
	private _port: number
	private _address: string
	private _requireSubscription: boolean
	private _completion: number
	private _serverSelectable: boolean
	private _charCapacity: number
	private _charsCount: number
	private _requiredRole: number
	private _status: number
	private _created_at: Date
	private _updated_at: Date
	private _deleted_at: Date | null

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
		this._id = id
		this._name = name
		this._port = port
		this._address = address
		this._requireSubscription = requireSubscription
		this._completion = completion
		this._serverSelectable = serverSelectable
		this._charCapacity = charCapacity
		this._charsCount = charsCount
		this._requiredRole = requiredRole
		this._status = status
		this._created_at = created_at
		this._updated_at = updated_at
		this._deleted_at = deleted_at
	}

	public get id(): number {
		return this._id
	}

	public get name(): string {
		return this._name
	}

	public get port(): number {
		return this._port
	}

	public get address(): string {
		return this._address
	}

	public get requireSubscription(): boolean {
		return this._requireSubscription
	}

	public get completion(): number {
		return this._completion
	}

	public get serverSelectable(): boolean {
		return this._serverSelectable
	}

	public get charCapacity(): number {
		return this._charCapacity
	}

	public get charsCount(): number {
		return this._charsCount
	}

	public get requiredRole(): number {
		return this._requiredRole
	}

	public get status(): number {
		return this._status
	}

	public get created_at(): Date {
		return this._created_at
	}

	public get updated_at(): Date {
		return this._updated_at
	}

	public get deleted_at(): Date | null {
		return this._deleted_at
	}

	public static get worlds(): World[] {
		return this._Worlds
	}

	public static set worlds(worlds: World[]) {
		this._Worlds = worlds
	}

	public toWorldServerData(): WorldServerData {
    return new WorldServerData(
      this._id,
      this._address,
      this._port,
      this._name,
      this._charCapacity,
      this._requiredRole,
      false,
      this._serverSelectable,
      this._requireSubscription
    )
  }
}

export default World