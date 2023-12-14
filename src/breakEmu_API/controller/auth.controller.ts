import Logger from "../../breakEmu_Core/Logger"
import Database from "../Database"
import BaseController from "./base.controller"
import Prisma from "@prisma/client"
import { AuthClient } from "../../breakEmu_Auth/AuthClient"
import {
	IdentificationFailedMessage,
	IdentificationFailureReasonEnum,
	NicknameAcceptedMessage,
	NicknameErrorEnum,
	NicknameRefusedMessage,
	NicknameRegistrationMessage,
} from "../../breakEmu_Server/IO"
import { genSaltSync, hashSync, compareSync } from "bcrypt"

class AuthController extends BaseController {
	public _logger: Logger = new Logger("AuthController")
	public _database: Database = Database.getInstance()

	constructor(client: AuthClient) {
		super(client)
	}

	public initialize(): void {
		throw new Error("Method not implemented.")
	}

	async login(username: string, password: string) {
		try {
			const user = await this._database.prisma.user.findUnique({
				where: {
					username,
				},
			})

			if (!user) {
				await this.AuthClient.Send(
					this.AuthClient.serialize(
						new IdentificationFailedMessage(
							IdentificationFailureReasonEnum.WRONG_CREDENTIALS
						)
					)
				)

				await this._logger.writeAsync(`User ${username} not found`)
				return
			}

			const isPasswordValid = compareSync(password, user.password)

			if (!isPasswordValid) {
				await this.AuthClient.Send(
					this.AuthClient.serialize(
						new IdentificationFailedMessage(
							IdentificationFailureReasonEnum.WRONG_CREDENTIALS
						)
					)
				)

				await this._logger.writeAsync(`Wrong password for user ${username}`)
				return
			}

			if (!user.is_verified) {
				await this.AuthClient.Send(
					this.AuthClient.serialize(
						new IdentificationFailedMessage(
							IdentificationFailureReasonEnum.EMAIL_UNVALIDATED
						)
					)
				)

				await this._logger.writeAsync(`Email of user ${username} not verified`)
				return
			}

			if (!user.pseudo) {
				await this.AuthClient.Send(
					this.AuthClient.serialize(new NicknameRegistrationMessage())
				)
				return user
			}

			if (user.is_banned) {
				await this.AuthClient.Send(
					this.AuthClient.serialize(
						new IdentificationFailedMessage(
							IdentificationFailureReasonEnum.BANNED
						)
					)
				)

				await this._logger.writeAsync(`User ${username} is banned`)
				return
			}
			return user
		} catch (error) {
			this._logger.write(`Error logging in: ${error}`)
		}
	}

	async setNickname(nickname: string): Promise<boolean> {
		try {
			const user = await this._database.prisma.user.findMany({
				where: {
					pseudo: nickname,
				},
			})

			if (user?.length > 0) {
				await this.AuthClient.Send(
					this.AuthClient.serialize(
						new NicknameRefusedMessage(NicknameErrorEnum.ALREADY_USED)
					)
				)
				return false
			}

			if (nickname.length < 2) {
				await this.AuthClient.Send(
					this.AuthClient.serialize(
						new NicknameRefusedMessage(NicknameErrorEnum.INVALID_NICK)
					)
				)
				return false
			}

			if (nickname === this.AuthClient.account?.username) {
				await this.AuthClient.Send(
					this.AuthClient.serialize(
						new NicknameRefusedMessage(NicknameErrorEnum.SAME_AS_LOGIN)
					)
				)
				return false
			}

			if (nickname.includes(this.AuthClient.account?.username as string)) {
				await this.AuthClient.Send(
					this.AuthClient.serialize(
						new NicknameRefusedMessage(NicknameErrorEnum.TOO_SIMILAR_TO_LOGIN)
					)
				)
				return false
			}

			await this._database.prisma.user.update({
				where: {
					username: this.AuthClient.account?.username,
				},
				data: {
					pseudo: nickname,
				},
			})

			await this.AuthClient.Send(
				this.AuthClient.serialize(new NicknameAcceptedMessage())
			)

      return true
		} catch (error) {
			this._logger.write(`Error setting nickname: ${error}`)
      return false
		}
	}
}

export default AuthController
