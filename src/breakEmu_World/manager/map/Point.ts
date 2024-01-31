class Point {
	private _x: number
	private _y: number

	constructor(public X: number, public Y: number) {
		this._x = X
		this._y = Y
	}

	public get x(): number {
		return this._x
	}

	public get y(): number {
		return this._y
	}

	public set x(value: number) {
		this._x = value
	}

	public set y(value: number) {
		this._y = value
	}

	public toString(): string {
		return `(${this._x},${this._y})`
	}
}

export default Point
