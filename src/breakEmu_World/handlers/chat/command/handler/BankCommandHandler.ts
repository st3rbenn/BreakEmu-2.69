import Character from "@breakEmu_API/model/character.model"
import Item from "@breakEmu_API/model/item.model"
import Logger from "@breakEmu_Core/Logger"
import BankHandler from "@breakEmu_World/manager/map/element/interactiveElement/BankHandler"
import WorldServer from "@breakEmu_World/WorldServer"
import AccountRoleEnum from "../../../../enum/AccountRoleEnum"
import CommandHandler, { TCommandHandler } from "../CommandHandler"

class BankCommandHandler {
	static logger: Logger = new Logger("BankCommandHandler")

	static commandHandler: TCommandHandler = {
		bank: {
			execute: async (args, message, character) => {
				await CommandHandler.helpCommand(character, this.commandHandler)
			},
			description: "",
			command: "bank",
			neededRole: [AccountRoleEnum.MODERATOR],
			show: true,
			nbRequiredArgs: 0,
			asHelp: true,
			hasSubCommands: true,
			subCommandHandlers: {
				open: {
					execute: async (args, message, character) => {
						await this.openBank(character)
					},
					description: "open the bank",
					command: "open",
					neededRole: [AccountRoleEnum.MODERATOR],
					show: true,
					nbRequiredArgs: 0,
				},
				// add: {
				// 	execute: async (args, message, character) => {
				// 		await this.addItem(
				// 			parseInt(args[0]),
				// 			parseInt(args[1]),
				// 			parseInt(args[2]),
				// 			args[3] === "true",
				// 			character
				// 		)
				// 	},
				// 	description: "Add an item to the inventory",
				// 	command: "add",
				// 	neededRole: [AccountRoleEnum.MODERATOR],
				// 	show: true,
				// 	nbRequiredArgs: 3,
				// 	requiredArgs: ["characterId", "itemId", "quantity"],
				// },
				// remove: {
				// 	execute: async (args, message, character) => {
				// 		await this.removeItem(
				// 			parseInt(args[0]),
				// 			parseInt(args[1]),
				// 			parseInt(args[2]),
				// 			character
				// 		)
				// 	},
				// 	description: "Remove an item from the inventory",
				// 	command: "remove",
				// 	neededRole: [AccountRoleEnum.MODERATOR],
				// 	show: true,
				// 	nbRequiredArgs: 3,
				// 	requiredArgs: ["characterId", "itemId", "quantity"],
				// },
				// list: {
				// 	execute: async (args, message, character) => {
				// 		await character.reply("list")
				// 	},
				// 	description: "List items in the inventory",
				// 	command: "list",
				// 	neededRole: [AccountRoleEnum.MODERATOR],
				// 	show: true,
				// 	nbRequiredArgs: 0,
				// },
			},
		},
	}

	private static async openBank(character: Character) {
		await new BankHandler().handle(character)
    
		// await character.client.Send(
		//   new NpcDialogCreationMessage(
		//     54534165,
		//     36
		//   )
		// )
	}

	private static async addItem(
		characterId: number,
		itemId: number,
		quantity: number,
		perfect: boolean = false,
		commandCaster: Character
	) {
		const clients = Array.from(WorldServer.getInstance().clients.values())

		for (const client of clients) {
			const character = client.selectedCharacter
			if (character?.id === characterId) {
				const itemTemplate = Item.getItem(itemId)

				if (!itemTemplate) {
					await commandCaster.replyError(`Item with id ${itemId} not found`)
					return
				}

				if (quantity < 1) {
					await commandCaster.replyError(`Quantity must be greater than 0`)
					return
				}

				await character?.inventory?.addNewItem(itemId, quantity, perfect)

				await character.reply(
					`Added ${quantity} ${itemTemplate.name} to your inventory`
				)
				return
			} else {
				await commandCaster.replyError(
					`Character with id ${characterId} not found`
				)
			}
		}
	}

	private static async removeItem(
		characterId: number,
		itemId: number,
		quantity: number = 0,
		commandCaster: Character
	) {
		const clients = Array.from(WorldServer.getInstance().clients.values())

		for (const client of clients) {
			const character = client.selectedCharacter
			if (character?.id === characterId) {
				const itemInInventory = Array.from(
					character.inventory?.items.values()
				).find((item) => item.record.id === itemId)

				if (!itemInInventory) {
					await commandCaster.replyError(
						`Item with id ${itemId} not found in ${character?.name} inventory`
					)
					return
				}

				if (quantity == 0) {
					//delete item
					await character.inventory?.removeItem(itemInInventory)
					await character.reply(
						`Removed ${itemInInventory.record.name} from your inventory`
					)
					return
				}

				if (quantity < 1) {
					await commandCaster.replyError(`Quantity must be greater than 0`)
					return
				}

				if (quantity > itemInInventory.quantity) {
					await commandCaster.replyError(
						`${character.name} don't have enough ${itemInInventory.record.name}`
					)
					return
				}

				itemInInventory.quantity -= quantity

				await character.inventory?.updateItemQuantity(itemInInventory)

				await character.reply(
					`Remove ${quantity} ${itemInInventory.record.name} to your inventory`
				)

				return
			} else {
				await commandCaster.replyError(
					`Character with id ${characterId} not found`
				)
			}
		}
	}

	private listItems() {
		// ...
	}
}

export default BankCommandHandler
