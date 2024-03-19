import Character from "../../../../../breakEmu_API/model/character.model"
import Logger from "../../../../../breakEmu_Core/Logger"
import ZaapDialog from "../../../../../breakEmu_World/manager/dialog/ZaapDialog"
import AccountRoleEnum from "../../../../enum/AccountRoleEnum"
import BankDialog from "../../../../manager/dialog/BankDialog"
import { TCommandHandler } from "../CommandHandler"

class UtilsCommandHandler {
	private static logger: Logger = new Logger("UtilsCommandHandler")

	static commandHandler: TCommandHandler = {
		setspawnpoint: {
			execute: async (args, message, character) => {
				await this.setSpawnPoint(character)
			},
			description: "Set the current map as the spawn point for the character",
			command: "setSpawnPoint",
			neededRole: [
				AccountRoleEnum.USER,
				AccountRoleEnum.ADMIN,
				AccountRoleEnum.MODERATOR,
			],
			show: true,
			nbRequiredArgs: 0,
		},

		spawn: {
			execute: async (args, message, character) => {
				await this.spawn(character)
			},
			description: "Teleport to the spawn point",
			command: "spawn",
			neededRole: [
				AccountRoleEnum.USER,
				AccountRoleEnum.ADMIN,
				AccountRoleEnum.MODERATOR,
			],
			show: true,
			nbRequiredArgs: 0,
		},

		bank: {
			execute: async (args, message, character) => {
				const dialog = new BankDialog(character)
				await character.setDialog(dialog)
			},
			description: "Open the bank",
			command: "bank",
			neededRole: [
				AccountRoleEnum.USER,
				AccountRoleEnum.ADMIN,
				AccountRoleEnum.MODERATOR,
			],
			show: true,
			nbRequiredArgs: 0,
		},
    zaap: {
      execute: async (args, message, character) => {
        const dialog = new ZaapDialog(character)
        await character.setDialog(dialog)
      },
      description: "Open the zaap dialog",
      command: "zaap",
      neededRole: [
        AccountRoleEnum.USER,
        AccountRoleEnum.ADMIN,
        AccountRoleEnum.MODERATOR,
      ],
      show: true,
      nbRequiredArgs: 0,
    },

    unblock: {
      execute: async (args, message, character) => {
        await this.unblockCharacter(character)
      },
      description: "Unblock the character",
      command: "unblock",
      neededRole: [
        AccountRoleEnum.USER,
        AccountRoleEnum.ADMIN,
        AccountRoleEnum.MODERATOR,
      ],
      show: true,
      nbRequiredArgs: 0,
    }
	}

	static async setSpawnPoint(character: Character) {
		const map = character.map

		if (!map) {
			await character.replyError("You are not on a map")
			return
		}

		character.spawnMapId = map.id
		character.spawnCellId = character.cellId

		await character.reply(`Spawn point set 💅`)
		return
	}

	static async spawn(character: Character) {
		const map = character.map

		if (!map) {
			await character.replyError("You are not on a map")
			return
		}

		this.logger.write(
			`Teleporting ${character.name} to spawn point: ${character.spawnMapId}, ${character.spawnCellId}`
		)

		if (character.spawnMapId == 0 || character.spawnCellId == 0) {
			await character.replyError("Spawn point not set")
			return
		}

		await character.teleport(
			character.spawnMapId as number,
			character.spawnCellId
		)

		await character.reply(`Teleported to spawn point`)
		return
	}

  static async unblockCharacter(character: Character) {
    const map = character.map

    if(map) {
      const isBlocked = await map.instance.isCharacterBlocked(character)
      if(isBlocked) {
        const freeCell = map.unblockCell()
        character.cellId = freeCell.id
        await character.refreshActorOnMap()
        await character.reply("Character unblocked")
        return
      } else {
        await character.replyError("Character is not blocked")
        return
      }
    }
  }
}

export default UtilsCommandHandler
