import Logger from "@breakEmu_Core/Logger"
import {
	GuildCreationResultMessage,
	GuildCreationStartedMessage,
	LeaveDialogMessage,
	SocialGroupCreationResultEnum,
} from "@breakEmu_Protocol/IO"
import WorldClient from "../../WorldClient"

class GuildHandler {
	private static logger: Logger = new Logger("GuildHandler")

	static async SendGuildCreationResultMessage(
		client: WorldClient,
		socialGroup: SocialGroupCreationResultEnum
	): Promise<void> {
		try {
			await client.Send(new GuildCreationResultMessage(socialGroup))
		} catch (error) {
			this.logger.error(error as any)
		}
	}

  static async SendGuildCreationStartedMessage(client: WorldClient): Promise<void> {
    await client.Send(new GuildCreationStartedMessage())
  }
}

export default GuildHandler
