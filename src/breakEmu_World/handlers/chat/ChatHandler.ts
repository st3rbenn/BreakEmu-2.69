import Logger from "@breakEmu_Core/Logger"
import {
	AdminCommandMessage,
	ChatClientMultiMessage,
} from "@breakEmu_Protocol/IO"
import WorldClient from "../../WorldClient"
import CommandHandler from "./command/CommandHandler"
import Container from "@breakEmu_Core/container/Container"

class ChatHandler {
	private static logger: Logger = new Logger("ChatHandler")
	private static container: Container = Container.getInstance()

	public static async handleChatClientMultiMessage(
		client: WorldClient,
		message: ChatClientMultiMessage
	) {
		const { content } = message
		const { command, args } = this.parseMessage(content as string)

		try {
			if (command) {
				await this.container
					.get(CommandHandler)
					.onCommandReceived(command, args, content!, client.selectedCharacter)
			} else {
				this.logger.write(
					`New message: ${content}, send by ${client.selectedCharacter.name}`
				)
			}
		} catch (e) {
			this.logger.error(`Error while executing command`)
		}
	}

	public static async handleAdminCommandMessage(
		client: WorldClient,
		message: AdminCommandMessage
	) {
		const { messageUuid, content } = message

		const { command, args } = this.parseMessage(content as string)

		this.logger.write(
			`New admin command: ${content}, send by ${client.selectedCharacter.name}`
		)

		try {
			await this.container
				.get(CommandHandler)
				.onCommandReceived(
					command!,
					args,
					content as string,
					client.selectedCharacter
				)
		} catch (e) {
			this.logger.error(`Error while executing admin command`)
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
