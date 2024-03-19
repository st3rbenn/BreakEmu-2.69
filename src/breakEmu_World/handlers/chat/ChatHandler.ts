import Logger from "../../../breakEmu_Core/Logger"
import { ChatClientMultiMessage } from "../../../breakEmu_Server/IO"
import WorldClient from "../../WorldClient"
import CommandHandler from "./command/CommandHandler"

class ChatHandler {
	private static logger: Logger = new Logger("ChatHandler")

	public static async handleChatClientMultiMessage(
		client: WorldClient,
		message: ChatClientMultiMessage
	) {
		const { content } = message
		const { command, args } = this.parseMessage(content as string)

		if (command) {
      await CommandHandler.onMessageReceived(command, args, content as string, client.selectedCharacter)
		} else {
			this.logger.write(
				`New message: ${content}, send by ${client.selectedCharacter.name}`
			)
		}
	}

	public static parseMessage(
		content: string
	): { command?: string; args: string[] } {
		const match = content.match(/^\.(\w+)\s*(.*)/)
		if (!match) return { args: [] }

		const [, command, argsString] = match
		const args = argsString.split(/\s+/).filter((arg) => arg.length > 0)
		return { command, args }
	}
}

export default ChatHandler
