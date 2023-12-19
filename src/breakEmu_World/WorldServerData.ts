class WorldServerData {
	private id: number
	private address: string
	private port: number
	private name: string
	private capacity: number
	private requiredRole: number
	private isMonoAccount: boolean
	private isSelectable: boolean
	private requireSubscription: boolean

	constructor(
		id: number,
		address: string,
		port: number,
		name: string,
		capacity: number,
		requiredRole: number,
		isMonoAccount: boolean,
		isSelectable: boolean,
		requireSubscription: boolean
	) {
		this.id = id
		this.address = address
		this.port = port
		this.name = name
		this.capacity = capacity
		this.requiredRole = requiredRole
		this.isMonoAccount = isMonoAccount
		this.isSelectable = isSelectable
		this.requireSubscription = requireSubscription
	}

	public get Id(): number {
		return this.id
	}

	public get Address(): string {
		return this.address
	}

	public get Port(): number {
		return this.port
	}

	public get Name(): string {
		return this.name
	}

	public get Capacity(): number {
		return this.capacity
	}

	public get RequiredRole(): number {
		return this.requiredRole
	}

	public get IsMonoAccount(): boolean {
		return this.isMonoAccount
	}

	public get IsSelectable(): boolean {
		return this.isSelectable
	}

	public get RequireSubscription(): boolean {
		return this.requireSubscription
	}
}

export default WorldServerData
