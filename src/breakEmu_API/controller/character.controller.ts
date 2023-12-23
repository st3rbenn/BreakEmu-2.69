import WorldClient from "../../breakEmu_World/WorldClient"
import { ansiColorCodes } from "../../breakEmu_Core/Colors"
import Logger from "../../breakEmu_Core/Logger"
import {
	CharacterCreationRequestMessage,
	CharacterCreationResultMessage,
	EntityLook,
} from "../../breakEmu_Server/IO"
import Database from "../Database"
import Character from "../model/character.model"
import CharacterCreationResultEnum from "../../breakEmu_World/enum/CharacterCreationResultEnum"

class CharacterController {
	public _logger: Logger = new Logger("CharacterController")
	public _database: Database = Database.getInstance()

  private static _instance: CharacterController

	private NAME_REGEX: RegExp = /^[A-Z][a-z]{2,9}(?:-[A-Za-z][a-z]{2,9}|[a-z]{1,10})$/

	MaxCharacterSlots: number = 5

	constructor() {}

  public static getInstance(): CharacterController {
    if (!CharacterController._instance) {
      CharacterController._instance = new CharacterController()
    }

    return CharacterController._instance
  }

	public async getCharactersByAccountId(
		accountId: number
	): Promise<Character[] | undefined> {
		try {
			const characters = await this._database.prisma.character.findMany({
				where: {
					userId: accountId,
				},
			})

			let charactersList: Character[] = []

			for (const c of characters) {
				charactersList.push(
					new Character(
						c.id,
						c.breed_id,
						c.sex,
						c.cosmeticId,
						c.name,
						this.parseColors(c.colors)
					)
				)

				await this._logger.writeAsync(
					`Character ${c.name} found`,
					ansiColorCodes.bgGreen
				)
			}

			return charactersList
		} catch (error) {
			await this._logger.writeAsync(
				`Error while getting characters for account ${accountId}`
			)
		}
	}

	public async getCharacterByName(name: string) {}

	public async createCharacter(
		message: CharacterCreationRequestMessage,
		client: WorldClient
	): Promise<Character | undefined> {
		try {
			if (!message) {
				await this._logger.writeAsync(
					`Error while creating character: no message`
				)
				await client.Send(
					client.serialize(
						new CharacterCreationResultMessage(
							CharacterCreationResultEnum.ERR_NO_REASON
						)
					)
				)
				return undefined
			}

			if (!client.account) {
				await this._logger.writeAsync(
					`Error while creating character: no account`
				)
				await client.Send(
					client.serialize(
						new CharacterCreationResultMessage(
							CharacterCreationResultEnum.ERR_NO_REASON
						)
					)
				)
				return undefined
			}

			const characters = await this.getCharactersByAccountId(client.account.id)

			if (characters && characters.length >= this.MaxCharacterSlots) {
				await this._logger.writeAsync(
					`Error while creating character: too many characters`
				)
				await client.Send(
					client.serialize(
						new CharacterCreationResultMessage(
							CharacterCreationResultEnum.ERR_TOO_MANY_CHARACTERS
						)
					)
				)
				return undefined
			}

			const characterWithSameName = await this._database.prisma.character.findFirst(
				{
					where: {
						name: message.name,
					},
				}
			)

			if (characterWithSameName) {
				await this._logger.writeAsync(
					`Error while creating character: character with same name already exists: ${message.name}`
				)
				await client.Send(
					client.serialize(
						new CharacterCreationResultMessage(
							CharacterCreationResultEnum.ERR_INVALID_NAME
						)
					)
				)
				return undefined
			}

			if (!this.NAME_REGEX.test(message.name as string)) {
				await this._logger.writeAsync(
					`Error while creating character: invalid name: ${message.name}`
				)
				await client.Send(
					client.serialize(
						new CharacterCreationResultMessage(
							CharacterCreationResultEnum.ERR_INVALID_NAME
						)
					)
				)
				return undefined
			}

			const newCharacter = await this._database.prisma.character.create({
				data: {
					breed_id: message.breed as number,
					sex: message.sex as boolean,
					cosmeticId: message.cosmeticId as number,
					name: message.name as string,
					colors: this.serializeColors(message.colors as number[]),
					created_at: new Date(),
					userId: client.account.id as number,
				},
			})

			await this._logger.writeAsync(
				`Character ${newCharacter.name} created`,
				ansiColorCodes.bgGreen
			)

			const character = new Character(
				newCharacter.id,
				newCharacter.breed_id,
				newCharacter.sex,
				newCharacter.cosmeticId,
				newCharacter.name,
				this.parseColors(newCharacter.colors)
			)

			return character
		} catch (error) {
			await this._logger.writeAsync(`Error while creating character: ${error}`)
			await client.Send(
				client.serialize(
					new CharacterCreationResultMessage(
						CharacterCreationResultEnum.ERR_NO_REASON
					)
				)
			)
			return undefined
		}
	}

	async getCharacterByAccountId(
		accountId: number
	): Promise<Character[] | undefined> {
		try {
			const characters = await this._database.prisma.character.findMany({
				where: {
					userId: accountId,
				},
			})

			if (!characters) return undefined

			let charactersList: Character[] = []

			for (const c of characters) {
				const character = new Character(
					c.id,
					c.breed_id,
					c.sex,
					c.cosmeticId,
					c.name,
					this.parseColors(c.colors)
				)
				charactersList.push(character)
			}

			return charactersList
		} catch (error) {
			await this._logger.writeAsync(
				`Error while getting characters for account ${accountId}`
			)
			return undefined
		}
	}

	private parseColors(colors: string): number[] {
		return colors.split(",").map((color) => parseInt(color))
	}

	private serializeColors(colors: number[]): string {
		return colors.join(",")
	}
}

export default CharacterController
