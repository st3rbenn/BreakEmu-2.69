import { ansiColorCodes } from "../../../breakEmu_Core/Colors"
import Logger from "../../../breakEmu_Core/Logger"
import WorldClient from "../../../breakEmu_World/WorldClient"

import {
	BasicTimeMessage,
	ServerSettingsMessage,
	ServerOptionalFeaturesMessage,
	AccountCapabilitiesMessage,
	TrustStatusMessage,
	AuthenticationTicketAcceptedMessage,
	ServerSessionConstantsMessage,
	ServerSessionConstantInteger,
	ServerConstantTypeEnum,
} from "../../../breakEmu_Server/IO"

class AuthentificationHandler {
	private static logger: Logger = new Logger("AuthentificationHandler")

	public static async handleAuthenticationTicketMessage(client: WorldClient) {
		await this.logger.writeAsync(
			`Received AuthenticationTicketMessage message`,
			ansiColorCodes.lightGray
		)
		const date = new Date()
		await client.Send(
			client.serialize(new AuthenticationTicketAcceptedMessage())
		)
		await client.Send(
			client.serialize(
				new BasicTimeMessage(date.getTime(), date.getTimezoneOffset())
			)
		)
		await client.Send(
			client.serialize(
				new ServerSettingsMessage(false, true, "fr", 0, 0, 0, 200)
			)
		)
		await client.Send(
			client.serialize(
				new ServerOptionalFeaturesMessage([23])
			)
		)
		await client.Send(
			client.serialize(
				new ServerSessionConstantsMessage([
					new ServerSessionConstantInteger(
						ServerConstantTypeEnum.KOH_DURATION,
						7200000
					),
					new ServerSessionConstantInteger(
						ServerConstantTypeEnum.UNKNOWN_6,
						10
					),
					new ServerSessionConstantInteger(
						ServerConstantTypeEnum.UNKNOWN_7,
						2000
					),
				])
			)
		)
		await client.Send(
			client.serialize(
				new AccountCapabilitiesMessage(true, true, client.account?.id, 1)
			)
		)
		await client.Send(client.serialize(new TrustStatusMessage(true, true)))
	}
}

export default AuthentificationHandler
