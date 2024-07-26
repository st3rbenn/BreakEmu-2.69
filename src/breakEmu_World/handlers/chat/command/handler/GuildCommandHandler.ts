import Character from "../../../../../breakEmu_API/model/character.model"
import Experience from "../../../../../breakEmu_API/model/experience.model"
import Logger from "../../../../../breakEmu_Core/Logger"
import WorldServer from "../../../../../breakEmu_World/WorldServer"
import AccountRoleEnum from "../../../../enum/AccountRoleEnum"
import GuildCreationDialog from "../../../../manager/dialog/guild/GuildCreationDialog"
import CommandHandler, { TCommandHandler } from "../CommandHandler"

class GuildCommandHandler {
	static logger: Logger = new Logger("GuildCommandHandler")

	static commandHandler: TCommandHandler = {
		guild: {
			execute: async (args, message, character) => {
				await CommandHandler.helpCommand(character, this.commandHandler)
			},
			description: "",
			command: "guild",
			neededRole: [AccountRoleEnum.MODERATOR],
			show: true,
			nbRequiredArgs: 0,
			asHelp: true,
			hasSubCommands: true,
			subCommandHandlers: {
				new: {
					execute: async (args, message, character) => {
						await this.openGuildCreationDialog(character)
					},
					description: "Open guild creation panel",
					command: "new",
					neededRole: [AccountRoleEnum.MODERATOR],
					show: true,
					nbRequiredArgs: 0,
				},
			},
		},
	}

	private static async openGuildCreationDialog(character: Character) {
		const dialog = new GuildCreationDialog(character)
		await character.setDialog(dialog)
	}
}

export default GuildCommandHandler
