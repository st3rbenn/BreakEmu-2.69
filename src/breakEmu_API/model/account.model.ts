import Character from "./character.model"

class Account {
	private _id: number
	private _username: string
	private _password: string
	private _pseudo: string
	private _email: string
	private _is_verified: boolean
	private _firstname: string
	private _lastname: string
	private _birthdate: Date
  private _secretQuestion: string
	private _login_at: Date
	private _logout_at: Date
	private _created_at: Date
	private _updated_at: Date
	private _deleted_at: Date
	private _IP: string
	private _role: number
	private _is_banned: boolean
  private _tagNumber: number

  private _characters: Map<number, Character> = new Map();

	constructor(
		id: number,
		username: string,
		password: string,
		pseudo: string,
		email: string,
		is_verified: boolean,
		firstname: string,
		lastname: string,
		birthdate: Date,
    secretQuestion: string,
		login_at: Date,
		logout_at: Date,
		created_at: Date,
		updated_at: Date,
		deleted_at: Date,
		IP: string,
		role: number,
		is_banned: boolean,
    tagNumber: number
	) {
		this._id = id
		this._username = username
		this._password = password
		this._pseudo = pseudo
		this._email = email
		this._is_verified = is_verified
		this._firstname = firstname
		this._lastname = lastname
		this._birthdate = birthdate
    this._secretQuestion = secretQuestion
		this._login_at = login_at
		this._logout_at = logout_at
		this._created_at = created_at
		this._updated_at = updated_at
		this._deleted_at = deleted_at
		this._IP = IP
		this._role = role
		this._is_banned = is_banned
    this._tagNumber = tagNumber
	}

	public get id(): number {
		return this._id
	}

	public get username(): string {
		return this._username
	}

	public get password(): string {
		return this._password
	}

	public get pseudo(): string {
		return this._pseudo
	}

	public get email(): string {
		return this._email
	}

	public get is_verified(): boolean {
		return this._is_verified
	}

	public get firstname(): string {
		return this._firstname
	}

	public get lastname(): string {
		return this._lastname
	}

	public get birthdate(): Date {
		return this._birthdate
	}

  public get secretQuestion(): string {
    return this._secretQuestion
  }

	public get login_at(): Date {
		return this._login_at
	}

	public get IP(): string {
		return this._IP
	}

	public get is_banned(): boolean {
		return this._is_banned
	}

	public get role(): number {
		return this._role
	}

	public get is_admin(): boolean {
		return this._role === 5
	}

	public get logout_at(): Date {
		return this._logout_at
	}

	public get created_at(): Date {
		return this._created_at
	}

	public get updated_at(): Date {
		return this._updated_at
	}

	public get deleted_at(): Date {
		return this._deleted_at
	}

  public get tagNumber(): number {
    return this._tagNumber
  }

  public getRandomTagNumber(): number {
    return Math.floor(Math.random() * 100000)
  }

	public setPseudo(pseudo: string): void {
		this._pseudo = pseudo
	}

  public get characters(): Map<number, Character> {
    return this._characters
  }

  public set characters(characters: Map<number, Character>) {
    this._characters = characters
  }

	public toString(): string {
		return JSON.stringify(this)
	}
}

export default Account
