import Logger from "../../breakEmu_Core/Logger"
import Database from "../Database"
import BaseController from "./base.controller"
import AuthClient from "../../breakEmu_Auth/AuthClient"
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
				return user;
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
}

export default AuthController
