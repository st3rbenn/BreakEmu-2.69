import Container from "@breakEmu_Core/container/Container"
import Logger from "@breakEmu_Core/Logger"
import CommandHandler, { TCommandHandler } from "../CommandHandler"
import AccountRoleEnum from "@breakEmu_World/enum/AccountRoleEnum"
import WorldServer from "@breakEmu_World/WorldServer"

class ServerCommandHandler {
  static logger: Logger = new Logger("PlayerCommandHandler")
	public static container: Container = Container.getInstance()

	static commandHandler: TCommandHandler = {
		server: {
			execute: async (args, message, character) => {
				await this.container
					.get(CommandHandler)
					.helpCommand(character, this.commandHandler)
			},
			description: "",
			command: "server",
			neededRole: AccountRoleEnum.MODERATOR,
			show: false,
			nbRequiredArgs: 0,
			asHelp: true,
			hasSubCommands: true,
			subCommandHandlers: {
				save: {
					execute: async (args, message, character) => {
						await this.container
            .get(WorldServer)
            .save()
					},
					description: "Save the server",
					command: "save",
					neededRole: AccountRoleEnum.MODERATOR,
					show: true,
					nbRequiredArgs: 0,
				},
			},
		},
	}
}

export default ServerCommandHandler