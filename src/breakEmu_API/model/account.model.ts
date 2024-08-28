import AccountRoleEnum from "@breakEmu_World/enum/AccountRoleEnum"
import Character from "./character.model"

class Account {
	id: number
	username: string
	password: string
	pseudo: string
	email: string
	is_verified: boolean
	firstname: string
	lastname: string
	birthdate: Date
  secretQuestion: string
	login_at: Date
	logout_at: Date
	created_at: Date
	updated_at: Date
	deleted_at: Date
	IP: string
	role: number
	is_banned: boolean
  tagNumber: number

  _characters: Map<number, Character> = new Map();

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
		this.id = id
		this.username = username
		this.password = password
		this.pseudo = pseudo
		this.email = email
		this.is_verified = is_verified
		this.firstname = firstname
		this.lastname = lastname
		this.birthdate = birthdate
    this.secretQuestion = secretQuestion
		this.login_at = login_at
		this.logout_at = logout_at
		this.created_at = created_at
		this.updated_at = updated_at
		this.deleted_at = deleted_at
		this.IP = IP
		this.role = role
		this.is_banned = is_banned
    this.tagNumber = tagNumber
	}

  public getRandomTagNumber(): number {
    return Math.floor(Math.random() * 100000)
  }

	public setPseudo(pseudo: string): void {
		this.pseudo = pseudo
	}

  public get characters(): Map<number, Character> {
    return this._characters
  }

  public set characters(characters: Map<number, Character>) {
    this._characters = characters
  }

  public is_admin(): boolean {
    return this.role === AccountRoleEnum.MODERATOR
  }

	public toString(): string {
		return JSON.stringify(this)
	}
}

export default Account
