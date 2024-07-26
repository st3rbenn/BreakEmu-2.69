import Character from "../../../../breakEmu_API/model/character.model"
import Logger from "../../../../breakEmu_Core/Logger"
import {
	DialogTypeEnum,
	SocialGroupCreationResultEnum,
} from "../../../../breakEmu_Server/IO"
import DialogHandler from "../../../../breakEmu_World/handlers/dialog/DialogHandler"
import WorldClient from "../../../../breakEmu_World/WorldClient"
import GuildHandler from "../../../handlers/guild/GuildHandler"
import Dialog from "../Dialog"

class GuildCreationDialog extends Dialog {
	logger: Logger = new Logger("GuildCreationDialog")
	character: Character

	constructor(character: Character) {
		super()
		this.character = character
	}

	async open(): Promise<void> {
		try {
			if (this.character.guildId !== null) {
				await this.character.reply("You are already in a guild.")
				await GuildHandler.SendGuildCreationResultMessage(
					this.character.client,
					SocialGroupCreationResultEnum.SOCIAL_GROUP_CREATE_ERROR_ALREADY_IN_GROUP
				)
				return
			}

			await GuildHandler.SendGuildCreationStartedMessage(
				this.character.client as WorldClient
			)
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	async close(): Promise<void> {
		try {
			this.character.removeDialog()
			await DialogHandler.leaveDialogMessage(
				this.character.client as WorldClient,
				DialogTypeEnum.DIALOG_GUILD_CREATE
			)
		} catch (error) {
			this.logger.error(error as any)
		}
	}
}

export default GuildCreationDialog
