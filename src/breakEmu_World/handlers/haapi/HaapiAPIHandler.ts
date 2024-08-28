import Logger from "@breakEmu_Core/Logger"
import WorldClient from "../../WorldClient"

class HaapiAPIHandler {
	private static logger: Logger = new Logger("HaapiAPIHandler")

	static async HandleHaapiApiKeyRequestMessage(
		client: WorldClient
	): Promise<void> {
    this.logger.warn(
      `Client ${client.account?.username} requested Haapi API key`
    )
  }
}

export default HaapiAPIHandler
