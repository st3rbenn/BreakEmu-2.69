import Character from "@breakEmu_API/model/character.model"
import Logger from "@breakEmu_Core/Logger"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import AccountRoleEnum from "../../../../enum/AccountRoleEnum"
import CommandHandler, { TCommandHandler } from "../CommandHandler"
import Container from "@breakEmu_Core/container/Container"

class WarpCommandHandler {
	private static logger: Logger = new Logger("WarpCommandHandler")
  private static container: Container = Container.getInstance()

	static commandHandler: TCommandHandler = {
		warp: {
			execute: async (args, message, character) => {
				await this.container.get(CommandHandler).helpCommand(character, this.commandHandler)
			},
			description: "",
			command: "warp",
			neededRole: AccountRoleEnum.USER,
			show: true,
			nbRequiredArgs: 0,
			asHelp: true,
			hasSubCommands: true,
			subCommandHandlers: {
				spawn: {
					execute: async (args, message, character) => {
            await this.teleportToSpawn(character)
          },
					description: "Teleport to the spawn",
					command: "spawn",
					neededRole: AccountRoleEnum.USER,
					show: true,
					nbRequiredArgs: 0,
				},
			},
		},
	}

	static async teleportToSpawn(character: Character) {
		await character.teleport(
			this.container.get(ConfigurationManager).startMapId,
			this.container.get(ConfigurationManager).startCellId
		)

		await character.reply("You have been teleported to the spawn")
	}
}

export default WarpCommandHandler
