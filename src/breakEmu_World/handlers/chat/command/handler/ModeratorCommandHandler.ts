import Character from "@breakEmu_API/model/character.model"
import Logger from "@breakEmu_Core/Logger"
import AccountRoleEnum from "../../../../enum/AccountRoleEnum"
import { TCommandHandler } from "../CommandHandler"

class ModeratorCommandHandler {
	static logger: Logger = new Logger("ModeratorCommandHandler")

	static commandHandler: TCommandHandler = {
		tp: {
			execute: async (args, message, character) => {
				await this.tpCommand(args, character)
			},

			description: "Teleport to a map and cell",
			command: "tp !mapId ?cellId",
			neededRole: [AccountRoleEnum.MODERATOR],
			show: true,
			nbRequiredArgs: 0,
		},
		god: {
			execute: async (args, message, character) => {
				await this.godCommand(character)
			},
			description: "Enable/Disable godmode",
			command: "god",
			neededRole: [AccountRoleEnum.MODERATOR],
			show: true,
			nbRequiredArgs: 0,
		},
		whatPlayerDoing: {
			execute: async (args, message, character) => {
				await this.whatPlayerDoingCommand(character)
			},
			description: "Display what a player is doing",
			command: "whatPlayerDoing",
			neededRole: [AccountRoleEnum.MODERATOR],
			show: true,
			nbRequiredArgs: 0,
		},
	}

	static async whatPlayerDoingCommand(character: Character) {
		await character.whatPlayerDoing()
	}

	static async godCommand(character: Character) {
		await character.reply(
			`Godmode ${!character.godMode ? "enabled" : "disabled"}`
		)
		character.godMode = !character.godMode
	}

	static async tpCommand(args: string[], character: Character) {
		if (args.length == 1) {
			if (RegExp(/\D/).test(args[0])) {
				await character.replyError("invalid command - !tp mapId")
				return
			}

			const mapId = parseInt(args[0])

			if (mapId === character.mapId) {
				await character.replyError("You are already on this map")
				return
			}

			await character.teleport(mapId)
		} else if (args.length == 2) {
			if (RegExp(/\D/).test(args[0]) && RegExp(/\D/).test(args[0])) {
				await character.replyError("invalid command - !tp mapId cellId")
				return
			}

			const mapId = parseInt(args[0])
			const cellId = parseInt(args[1])

			if (mapId === character.mapId && cellId === character.cellId) {
				await character.replyError("You are already on this map")
				return
			}

			await character.teleport(mapId, cellId)
		} else {
			await character.replyError("invalid command - !tp mapId cellId")
		}
	}
}

export default ModeratorCommandHandler
