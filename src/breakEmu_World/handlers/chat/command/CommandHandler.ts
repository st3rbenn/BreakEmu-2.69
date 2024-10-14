import Character from "@breakEmu_API/model/character.model"
import Logger from "@breakEmu_Core/Logger"
import AccountRoleEnum from "../../../enum/AccountRoleEnum"
import InventoryCommandHandler from "./handler/InventoryCommandHandler"
import JobCommandHandler from "./handler/JobCommandHandler"
import ModeratorCommandHandler from "./handler/ModeratorCommandHandler"
import UtilsCommandHandler from "./handler/UtilsCommandHandler"
import WarpCommandHandler from "./handler/WarpCommandHandler"
import PlayerCommandHandler from "./handler/PlayerCommandHandler"
import GuildCommandHandler from "./handler/GuildCommandHandler"
import BankCommandHandler from "./handler/BankCommandHandler"
import NpcCommandHandler from "./handler/NpcCommandHandler"

interface ICommandHandler {
	command: string
	description: string
	neededRole: number

	show: boolean
	nbRequiredArgs: number
	requiredArgs?: string[]
	asHelp?: boolean
	hasSubCommands?: boolean
	subCommandHandlers?: TCommandHandler

	execute: (
		args: string[],
		message: string,
		character: Character
	) => void | Promise<void>
}

export type TCommandHandler = Record<string, ICommandHandler>

class CommandHandler {
	logger: Logger = new Logger("CommandHandler")

	constructor() {}

	commandHandlers: TCommandHandler = {
		help: {
			execute: async (args, message, character) => {
				await this.helpCommand(character)
			},
			description: "Display available commands",
			command: "help",

			neededRole: AccountRoleEnum.USER,
			show: true,
			nbRequiredArgs: 0,
			asHelp: true,
		},
	}

	registerCommandHandlers(newHandlers: TCommandHandler) {
		this.commandHandlers = { ...this.commandHandlers, ...newHandlers }
	}

	loadCommandHandlers() {
		this.registerCommandHandlers(InventoryCommandHandler.commandHandler)
		this.registerCommandHandlers(JobCommandHandler.commandHandler)
		this.registerCommandHandlers(WarpCommandHandler.commandHandler)
		this.registerCommandHandlers(PlayerCommandHandler.commandHandler)
		this.registerCommandHandlers(BankCommandHandler.commandHandler)
		this.registerCommandHandlers(GuildCommandHandler.commandHandler)
		this.registerCommandHandlers(NpcCommandHandler.commandHandler)
		this.registerCommandHandlers(UtilsCommandHandler.commandHandler)
		this.registerCommandHandlers(ModeratorCommandHandler.commandHandler)

		this.logger.write("Command handlers loaded.")
	}

	async onMessageReceived(
		command: string,
		args: string[],
		message: string,
		character: Character
	) {
		if (
			this.commandHandlers[command] &&
			this.commandHandlers[command].hasSubCommands
		) {
			await this.routeSubCommands(command, args, message, character)
		} else {
			await this.checkConditions(command, args, message, character)
		}
	}

	async routeSubCommands(
		mainCommand: string,
		subArgs: string[],
		message: string,
		character: Character
	) {
		const subCommandName = subArgs[0]

		// Récupération du gestionnaire de la sous-commande
		const commands = this.commandHandlers[mainCommand]
		const handler = commands.subCommandHandlers
			? commands.subCommandHandlers[subCommandName]
			: null

		if (!handler) {
			await character.replyError("Unknown sub-command.")
			return
		}

		if (!this.checkRole(handler, character)) {
			await character.replyWarning(
				"You don't have the right to use this sub-command."
			)
			return
		}

		if (subArgs.length - 1 < handler.nbRequiredArgs) {
			await character.replyWarning(
				`Not enough arguments. <br>${handler.requiredArgs?.join(
					", "
				)} required.`
			)
			return
		}

		await handler.execute(subArgs.slice(1), message, character)
	}

	async checkConditions(
		commandName: string,
		args: string[],
		message: string,
		character: Character
	) {
		const command = this.commandHandlers[commandName]

		if (!command) {
			await character.replyError("Unknown command.")
			return
		}

		if (!this.checkRole(command, character)) {
			await character.replyWarning(
				"You don't have the right to use this command."
			)
			return
		}

		if (command.asHelp && args.length === 0) {
			await command.execute(args, message, character)
			return
		}

		if (args.length < command.nbRequiredArgs) {
			await character.replyWarning("Not enough arguments.")
			return
		}

		await command.execute(args, message, character)

		await character.reply("Command executed.")
	}

	async helpCommand(
		character: Character,
		commandHandlers: TCommandHandler = this.commandHandlers
	) {
		let allCommands: string =
			'<br> <p style="text-align: center; color: tomato; border: 2px solid #e66465; border-radius: 25%">Available commands:</p> <br>'

		for (const commandName in commandHandlers) {
			const command = commandHandlers[commandName]
			if (this.checkRole(command, character) && command.show) {
				allCommands += `<br>${command.command} ${
					command.description ? `- ${command.description}` : ""
				}`

				if (command.hasSubCommands && command.subCommandHandlers) {
					for (const subCommandName in command.subCommandHandlers) {
						const subCommand = command.subCommandHandlers[subCommandName]
						if (this.checkRole(command, character) && subCommand.show) {
							allCommands += `<br>&nbsp;&nbsp;&nbsp;&nbsp;${subCommand.command} - ${subCommand.description}`
						}
					}
				}
			}
		}

		await character.reply(allCommands)
	}

	checkRole(command: ICommandHandler, character: Character): boolean {
		// Assuming command has a requiredRole property that indicates the minimum required role for execution
		const requiredRole = command.neededRole

		// Compare the role of the character with the required role
		return character.account.role >= requiredRole
	}
}

export default CommandHandler
