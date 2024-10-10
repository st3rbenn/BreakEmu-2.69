import Character from "@breakEmu_API/model/character.model"
import Npc from "@breakEmu_API/model/npc.model"
import NpcTemplate from "@breakEmu_API/model/npcTemplate.model"
import Logger from "@breakEmu_Core/Logger"
import AccountRoleEnum from "../../../../enum/AccountRoleEnum"
import CommandHandler, { TCommandHandler } from "../CommandHandler"
import Container from "@breakEmu_Core/container/Container"

class NpcCommandHandler {
	private static logger: Logger = new Logger("NpcCommandHandler")
	private static container: Container = Container.getInstance()

	static commandHandler: TCommandHandler = {
		npc: {
			execute: async (args, message, character) => {
				await this.container
					.get(CommandHandler)
					.helpCommand(character, this.commandHandler)
			},
			description: "Npc commands",
			command: "npc",
			neededRole: [AccountRoleEnum.MODERATOR],
			show: true,
			nbRequiredArgs: 0,
			asHelp: true,
			hasSubCommands: true,
			subCommandHandlers: {
				new: {
					execute: async (args, message, character) => {
						await this.newNpc(args, character)
					},
					description: "Create a new npc",
					command: "new !npcTemplateId ?cellId",
					neededRole: [AccountRoleEnum.MODERATOR],
					show: true,
					nbRequiredArgs: 1,
				},
				list: {
					execute: async (args, message, character) => {
						await this.listNpcs(character)
					},
					description: "List all npcs in the map",
					command: "list",
					neededRole: [AccountRoleEnum.MODERATOR],
					show: true,
					nbRequiredArgs: 0,
				},
				delete: {
					execute: async (args, message, character) => {
						await this.deleteNpc(args, character)
					},
					description: "Delete a npc",
					command: "delete !npcId",
					neededRole: [AccountRoleEnum.MODERATOR],
					show: true,
					nbRequiredArgs: 1,
				},
			},
		},
	}

	static async newNpc(args: string[], character: Character) {
		//id npc template -> look gender
		//mapId cellId direction based on character position
		//so i need 1 arg at the moment
		if (args.length < 1) {
			await character.replyError("Invalid command -  !npcTemplateId ?cellId")
			return
		}

		if (RegExp(/\D/).test(args[0])) {
			await character.replyError("Invalid format - npcTemplateId (number)")
			return
		}

		if (RegExp(/\D/).test(args[1])) {
			await character.replyError("Invalid format - cellId (number)")
			return
		}

		const npcTemplateId = parseInt(args[0])
		const cellId = parseInt(args[1]) || character.cellId
    console.log('args cellId', parseInt(args[1]))
    console.log('character cellId', character.cellId)

		this.logger.info(`npcTemplateId: ${npcTemplateId}, cellId: ${cellId}`)

		const findTemplate = NpcTemplate.npcs.get(npcTemplateId)

		if (!findTemplate) {
			await character.replyError("Npc template not found")
			return
		}

		//create npc
		const newNpc = await Npc.newNpc(
			npcTemplateId,
			findTemplate.name,
			findTemplate.look,
			findTemplate.gender,
			character.mapId,
			cellId,
			character.direction,
			character.map
		)

		if (newNpc) {
			await character.reply(`Npc successfully created: ${newNpc.name}`)
		} else {
			await character.replyError("Error while creating npc")
		}
	}

	static async listNpcs(character: Character) {
		const npcs = Array.from(Npc.npcs.values()).filter(
			(npc) => npc.mapId === character.mapId
		)

		if (npcs.length === 0) {
			await character.reply("No npc found")
			return
		}

		let npcList = "Npcs:\n"

		npcs.forEach((npc) => {
			npcList += `Id: ${npc.id} - Name: ${npc.name}\n`
		})

		await character.reply(npcList)
	}

	static async deleteNpc(args: string[], character: Character) {
		if (args.length !== 1) {
			await character.replyError("Invalid command - !delete npcId")
			return
		}

		if (RegExp(/\D/).test(args[0])) {
			await character.replyError("Invalid format - npcId (number)")
			return
		}

		const npcId = parseInt(args[0])

		const npc = Npc.npcs.get(npcId)

		if (!npc) {
			await character.replyError(`Npc with id ${npcId} not found`)
			return
		}

		await npc.deleteNpc()

		await character.map.instance().removeEntity(npc)
		await character.reply(`Npc ${npc.name} deleted`)
		Npc.npcs.delete(npcId)
	}
}

export default NpcCommandHandler
