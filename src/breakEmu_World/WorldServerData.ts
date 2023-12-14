class WorldServerData {
  private _id: number;
  private _address: string;
  private _port: number;
  private _name: string;
  private _capacity: number;
  private _requiredRole: number;
  private _isMonoAccount: boolean;
  // private _isSelectable: boolean;
  private _requireSubscription: boolean;
  
  constructor(id: number, address: string, port: number, name: string, capacity: number, requiredRole: number, isMonoAccount: boolean, requireSubscription: boolean) {
    this._id = id
    this._address = address
    this._port = port
    this._name = name
    this._capacity = capacity
    this._requiredRole = requiredRole
    this._isMonoAccount = isMonoAccount
    // this._isSelectable = isSelectable
    this._requireSubscription = requireSubscription
  }

  public get Id(): number {
    return this._id
  }

  public get Address(): string {
    return this._address
  }

  public get Port(): number {
    return this._port
  }

  public get Name(): string {
    return this._name
  }

  public get Capacity(): number {
    return this._capacity
  }

  public get RequiredRole(): number {
    return this._requiredRole
  }

  public get IsMonoAccount(): boolean {
    return this._isMonoAccount
  }

  // public get IsSelectable(): boolean {
  //   return this._isSelectable
  // }

  public get RequireSubscription(): boolean {
    return this._requireSubscription
  }
}

export default WorldServerData