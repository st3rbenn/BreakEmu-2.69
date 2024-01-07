import Database from "../../breakEmu_API/Database"
import AuthClient from "../../breakEmu_Auth/AuthClient"
import Logger from "../../breakEmu_Core/Logger"
import {
	NicknameAcceptedMessage,
	NicknameErrorEnum,
	NicknameRefusedMessage,
} from "../../breakEmu_Server/IO"

class NicknameHandlers {
	private _logger: Logger = new Logger("NicknameHandlers")
	private _database: Database = Database.getInstance()

	private _client: AuthClient

	constructor(client: AuthClient) {
		this._client = client
	}

	async setNickname(nickname: string): Promise<boolean> {
		try {
			const user = await this._database.prisma.user.findMany({
				where: {
					pseudo: nickname,
				},
			})

			if (user?.length > 0) {
				this.handleRefusedNickname(NicknameErrorEnum.ALREADY_USED)
				return false
			}

			if (nickname.length < 2) {
				this.handleRefusedNickname(NicknameErrorEnum.INVALID_NICK)
				return false
			}

			if (nickname === this._client.account?.username) {
				this.handleRefusedNickname(NicknameErrorEnum.SAME_AS_LOGIN)
				return false
			}

			if (nickname.includes(this._client.account?.username as string)) {
				this.handleRefusedNickname(NicknameErrorEnum.TOO_SIMILAR_TO_LOGIN)
				return false
			}

			await this._database.prisma.user.update({
				where: {
					username: this._client.account?.username,
				},
				data: {
					pseudo: nickname,
				},
			})

			this._client?.account?.setPseudo(nickname as string)

			await this._client.Send(
				this._client.serialize(new NicknameAcceptedMessage())
			)

			return true
		} catch (error) {
			this._logger.write(`Error setting nickname: ${error}`)
			return false
		}
	}

	async handleRefusedNickname(error: NicknameErrorEnum): Promise<void> {
		await this._client.Send(
			this._client.serialize(new NicknameRefusedMessage(error))
		)
	}
}

export default NicknameHandlers
