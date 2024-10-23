import Character from "@breakEmu_API/model/character.model"
import Logger from "@breakEmu_Core/Logger"
import AccountRoleEnum from "../../../../enum/AccountRoleEnum"
import { TCommandHandler } from "../CommandHandler"
import Container from "@breakEmu_Core/container/Container"
import Database from "@breakEmu_API/Database"
import Npc from "@breakEmu_API/model/npc.model"
import NpcTemplate from "@breakEmu_API/model/npcTemplate.model"
import GameMap from "@breakEmu_API/model/map.model"
import { InteractiveElement } from "@breakEmu_Protocol/IO"
import InteractiveElementModel from "@breakEmu_API/model/InteractiveElement.model"

class ModeratorCommandHandler {
	private static logger: Logger = new Logger("ModeratorCommandHandler")
	private static container: Container = Container.getInstance()

	static commandHandler: TCommandHandler = {
		tp: {
			execute: async (args, message, character) => {
				await this.tpCommand(args, character)
			},

			description: "Teleport to a map and cell",
			command: "tp !mapId ?cellId",
			neededRole: AccountRoleEnum.MODERATOR,
			show: true,
			nbRequiredArgs: 1,
		},
		god: {
			execute: async (args, message, character) => {
				await this.godCommand(character)
			},
			description: "Enable/Disable godmode",
			command: "god",
			neededRole: AccountRoleEnum.MODERATOR,
			show: true,
			nbRequiredArgs: 0,
		},
		modeinfo: {
			execute: async (args, message, character) => {
				await this.modeInfo(character)
			},
			description: "Get information of selected element",
			command: "modeinfo",
			neededRole: AccountRoleEnum.MODERATOR,
			show: true,
			nbRequiredArgs: 0,
		},
		modeedit: {
			execute: async (args, message, character) => {
				await this.modeEdit(character)
			},
			description: "Edit information of selected element",
			command: "modeedit",
			neededRole: AccountRoleEnum.MODERATOR,
			show: true,
			nbRequiredArgs: 0,
		},
		reloadCurrentMap: {
			execute: async (args, message, character) => {
				await this.reloadCurrentMap(character)
			},
			description: "Reload the current map",
			command: "reloadCurrentMap",
			neededRole: AccountRoleEnum.MODERATOR,
			show: true,
			nbRequiredArgs: 0,
		},
		tti: {
			execute: async (args, message, character) => {
				await this.tryTextInformation(character, args)
			},
			description: "Try to send a text information",
			command: "tti",
			neededRole: AccountRoleEnum.MODERATOR,
			show: true,
			nbRequiredArgs: 2,
		},
		itea: {
			execute: async (args, message, character) => {
				await this.interactElementToAction(
					args.shift() as string,
					character,
					args
				)
			},
			description: "record elements information of used element for action",
			command: "itea",
			neededRole: AccountRoleEnum.MODERATOR,
			show: true,
			nbRequiredArgs: 1,
		},
	}

	static async reloadCurrentMap(character: Character) {
		try {
			await this.container.get(Database).reloadMapWithId(character.mapId)

			await character.reloadMap()

			await character.reply("Current map reloaded")
		} catch (error) {
			this.logger.error("Error while reloading current map")
		}
	}

	static async modeInfo(character: Character) {
		if (!character.godMode) {
			await character.replyError(
				"You need to be in godmode to use this command"
			)
			return
		} else {
			character.infoMode = !character.infoMode
			await character.reply(
				`Info mode ${character.infoMode ? "enabled" : "disabled"}`
			)
		}
	}

	static async modeEdit(character: Character) {
		if (!character.godMode) {
			await character.replyError(
				"You need to be in godmode to use this command"
			)
			return
		} else {
			character.editMode = !character.editMode
			await character.reply(
				`Edit mode ${character.editMode ? "enabled" : "disabled"}`
			)
		}
	}

	static async godCommand(character: Character) {
		await character.reply(
			`Godmode ${!character.godMode ? "enabled" : "disabled"}`
		)
		character.godMode = !character.godMode
		character.infoMode = false
		character.editMode = false
		character.lastElementsUsed.clear()
	}

	static async interactElementToAction(
		action: string,
		character: Character,
		args: string[]
	) {
		switch (action) {
			case "setZaap":
				await character.interactElementToSetZaap()
				break
			case "setZaapi":
				// await character.interactElementToSetZaapi()
				break
			case "modifyElem":
				await this.modifyElementsInfo(character, args)
				break
			default:
				await character.replyError(`Invalid action: ${action}`)
				break
		}
	}

	static async startRecordMaps(character: Character) {
		character.startRecord = !character.startRecord

		if (character.startRecord) {
			await character.reply("Start recording maps")
			character.listMaps.set(character.mapId, character.map)
		} else {
			await character.reply("Stop/Save recording maps")
			// await this.saveRecordedMaps(character)
			character.listMaps.clear()
		}
	}

	static async modifyElementsInfo(character: Character, args: string[]) {
		if (args.length < 2) {
			character.replyError("invalid format - skillId type")
			return
		}

		// if (RegExp(/\D/).test(args[0]) && RegExp(/\D/).test(args[1])) {
		// 	character.replyError("invalid format - skillId type")
		// 	return
		// }

		const elementType = 1
		// const skillId = args[0]
		const param1 = args[0]
		const param2 = args[1]

		if (!character.godMode) {
			await character.replyError(
				"You need to be in godmode to use this command"
			)
			return
		} else {
			for (const element of character.lastElementsUsed.values()) {
				// element.record.skill.skillId = parseInt(skillId)
				element.record.skill.param1 = param1
				element.record.skill.param2 = param2
        element.record.skill.param3 = character.direction.toString()

				await this.container.get(Database).prisma.interactiveSkill.update({
					where: {
						id: element.record.skill.id,
						identifier: element.record.skill.identifier,
					},
					data: {
						// skillId: skillId,
						param1: param1,
						param2: param2,
					},
				})

				element.mapInstance.elements.set(
					element.record.elementId,
					element.record.getMapElement(element.mapInstance)
				)

				await character.reply(
					`Element ${element.record.elementId} modified with param1 ${param1} and param2 ${param2}`
				)

				character.lastElementsUsed.delete(element.record.id)
			}
		}
	}

	static async tryTextInformation(character: Character, args: string[]) {
		if (args.length < 2) {
			await character.replyError("invalid format - !tti type messageId")
			return
		}

		if (RegExp(/\D/).test(args[0]) && RegExp(/\D/).test(args[1])) {
			await character.replyError("invalid format - !tti type messageId")
			return
		}

		const type = parseInt(args[0])
		const messageId = parseInt(args[1])

		await character.textInformation(type, messageId, [])
	}

	static async whatPlayerDoingCommand(character: Character) {
		await character.whatPlayerDoing()
	}

	static async tpCommand(args: string[], character: Character) {
		if (args.length == 1) {
			if (RegExp(/\D/).test(args[0])) {
				await character.replyError("invalid format - !tp mapId (number)")
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
				await character.replyError(
					"invalid format - !tp mapId cellId (number) (number)"
				)
				return
			}

			const mapId = parseInt(args[0])
			let cellId = parseInt(args[1])

			if (mapId === character.mapId && cellId === character.cellId) {
				await character.replyError(
					"Why you try to teleport to the same cell ? are you ok ? 🤣"
				)
				return
			}

			if (cellId < 0 || cellId > 560) {
				await character.replyError("Invalid cellId")
				return
			}

			await character.teleport(mapId, cellId)
		} else {
			await character.replyError("invalid command - !tp mapId cellId")
		}
	}
}

export default ModeratorCommandHandler
