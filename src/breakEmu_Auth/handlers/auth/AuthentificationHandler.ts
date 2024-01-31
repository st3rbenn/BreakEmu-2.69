import { RSA_PKCS1_PADDING } from "constants"
import { privateDecrypt } from "crypto"
import AuthController from "../../../breakEmu_API/controller/auth.controller"
import Account from "../../../breakEmu_API/model/account.model"
import AuthClient from "../../../breakEmu_Auth/AuthClient"
import AuthTransition from "../../../breakEmu_Auth/AuthTransition"
import { ansiColorCodes } from "../../../breakEmu_Core/Colors"
import Logger from "../../../breakEmu_Core/Logger"
import ConfigurationManager from "../../../breakEmu_Core/configuration/ConfigurationManager"
import {
  BinaryBigEndianReader,
  CredentialsAcknowledgementMessage,
  DofusMessage,
  IdentificationMessage,
  IdentificationSuccessMessage,
} from "../../../breakEmu_Server/IO"
import ServerListHandler from "../server/ServerListHandler"

class AuthentificationHandler {
	private static logger: Logger = new Logger("AuthentificationHandler")

	static async handleIdentificationMessage(
		attrs: any,
		message: DofusMessage,
		client: AuthClient
	): Promise<void> {
		const authController = new AuthController(client)
		const clearCredentials = privateDecrypt(
			{
				key: attrs.privateKey,
				padding: RSA_PKCS1_PADDING,
			},
			new Int8Array((message as IdentificationMessage).credentials!)
		)

		const credentialsReader = new BinaryBigEndianReader({
			maxBufferLength: clearCredentials.length,
		}).writeBuffer(clearCredentials)

		credentialsReader.setPointer(credentialsReader.getPointer() + 32)

		const AESKey = credentialsReader.readBuffer(32, true, {
			maxBufferLength: 32,
		})
		const username = credentialsReader.readUTFBytes(
			credentialsReader.readByte()
		)
		const password = credentialsReader.readUTFBytes(
			credentialsReader.getReadableSize()
		)

		if (ConfigurationManager.getInstance().showDebugMessages) {
			await this.logger.writeAsync(
				`AESKey: ${AESKey.toString(
					"hex"
				)}, username: ${username}, password: ${password}`,
				ansiColorCodes.lightGray
			)
		}

		const user = await authController.login(username, password)

		// if (user?.pseudo === null) {
		// 	return;
		// }
		client.account = new Account(
			user?.id as number,
			user?.username as string,
			user?.password as string,
			user?.pseudo as string,
			user?.email as string,
			user?.is_verified as boolean,
			user?.firstname as string,
			user?.lastname as string,
			user?.birthdate as Date,
			user?.secretQuestion as string,
			user?.login_at as Date,
			user?.logout_at as Date,
			user?.updated_at as Date,
			user?.created_at as Date,
			user?.deleted_at as Date,
			user?.ip as string,
			user?.role as number,
			user?.is_banned as boolean,
			user?.tagNumber as number
		)

		if (user?.pseudo !== null && user?.pseudo !== "") {
			if (ConfigurationManager.getInstance().showProtocolMessage) {
				await this.logger.writeAsync(
					"Sending CredentialsAknowledgementMessage message"
				)
			}
			await client.Send(
				client.serialize(new CredentialsAcknowledgementMessage())
			)
			await this.handleIdentificationSuccessMessage(client)
			await ServerListHandler.handleServersListMessage(client)
		}
	}

	static async handleIdentificationSuccessMessage(
		client: AuthClient,
		wasArleadyConnected: boolean = false
	): Promise<void> {
		const subscriptionEndDateUnix = Math.floor(Date.now() * 1000) + 31536000

		const identificationSuccessMessage = new IdentificationSuccessMessage(
			client.account?.is_admin,
			client.account?.is_admin,
			client.account?.pseudo,
			(client.account?.tagNumber as number).toString(),
			wasArleadyConnected,
			client.account?.username,
			client.account?.id,
			134,
			client.account?.created_at.getTime(),
			subscriptionEndDateUnix,
			0
		)
		if (ConfigurationManager.getInstance().showProtocolMessage) {
			await this.logger.writeAsync(
				"Sending IdentificationSuccessMessage message"
			)
		}

		await client.Send(client.serialize(identificationSuccessMessage))
	}
}

export default AuthentificationHandler
