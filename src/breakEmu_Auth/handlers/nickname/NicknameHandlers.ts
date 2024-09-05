import Database from "@breakEmu_API/Database"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import {
	DofusMessage,
	NicknameAcceptedMessage,
	NicknameChoiceRequestMessage,
	NicknameErrorEnum,
	NicknameRefusedMessage,
} from "@breakEmu_Protocol/IO"
import AuthClient from "../../AuthClient"
import AuthentificationHandler from "../auth/AuthentificationHandler"
import ServerListHandler from "../server/ServerListHandler"
import Container from "@breakEmu_Core/container/Container"

class NicknameHandlers {
	private static logger: Logger = new Logger("NicknameHandlers")
	private static container: Container = Container.getInstance()

	static async setNickname(
		nickname: string,
		client: AuthClient
	): Promise<boolean> {
		try {
			const user = await this.container.get(Database).prisma.user.findMany({
				where: {
					pseudo: nickname,
				},
			})

			if (user?.length > 0) {
				this.handleRefusedNickname(NicknameErrorEnum.ALREADY_USED, client)
				return false
			}

			if (nickname.length < 2) {
				this.handleRefusedNickname(NicknameErrorEnum.INVALID_NICK, client)
				return false
			}

			if (nickname === client.account?.username) {
				this.handleRefusedNickname(NicknameErrorEnum.SAME_AS_LOGIN, client)
				return false
			}

			if (nickname.includes(client.account?.username as string)) {
				this.handleRefusedNickname(
					NicknameErrorEnum.TOO_SIMILAR_TO_LOGIN,
					client
				)
				return false
			}

			await this.container.get(Database).prisma.user.update({
				where: {
					username: client.account?.username,
				},
				data: {
					pseudo: nickname,
				},
			})

			client?.account?.setPseudo(nickname as string)

			await client.Send(new NicknameAcceptedMessage())

			return true
		} catch (error) {
			this.logger.write(`Error setting nickname: ${error}`)
			return false
		}
	}

	static async handleNicknameChoiceRequestMessage(
		message: DofusMessage,
		client: AuthClient
	): Promise<void> {
		const nickname = (message as NicknameChoiceRequestMessage).nickname

		if (this.container.get(ConfigurationManager).showDebugMessages) {
			await this.logger.writeAsync(
				`Nickname: ${nickname}`,
				ansiColorCodes.lightGray
			)
		}

		const isNicknameDone = await this.setNickname(nickname as string, client)

		if (isNicknameDone) {
			this.logger.write(`isNicknameDone: ${isNicknameDone}`)
			await AuthentificationHandler.handleIdentificationSuccessMessage(client)
			await ServerListHandler.handleServersListMessage(client)
		}
	}

	static async handleRefusedNickname(
		error: NicknameErrorEnum,
		client: AuthClient
	): Promise<void> {
		await client.Send(new NicknameRefusedMessage(error))
	}
}

export default NicknameHandlers
