import Character from "@breakEmu_API/model/character.model"
import Logger from "@breakEmu_Core/Logger"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import AccountRoleEnum from "../../../../enum/AccountRoleEnum"
import CommandHandler, { TCommandHandler } from "../CommandHandler"

class WarpCommandHandler {
	private static logger: Logger = new Logger("WarpCommandHandler")

	static commandHandler: TCommandHandler = {
		warp: {
			execute: async (args, message, character) => {
				await CommandHandler.helpCommand(character, this.commandHandler)
			},
			description: "",
			command: "warp",
			neededRole: [
				AccountRoleEnum.USER,
				AccountRoleEnum.ADMIN,
				AccountRoleEnum.MODERATOR,
			],
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
					neededRole: [
						AccountRoleEnum.USER,
						AccountRoleEnum.ADMIN,
						AccountRoleEnum.MODERATOR,
					],
					show: true,
					nbRequiredArgs: 0,
				},
			},
		},
	}

	static async teleportToSpawn(character: Character) {
		await character.teleport(
			ConfigurationManager.getInstance().startMapId,
			ConfigurationManager.getInstance().startCellId
		)

		await character.reply("You have been teleported to the spawn")
	}
}

export default WarpCommandHandler
