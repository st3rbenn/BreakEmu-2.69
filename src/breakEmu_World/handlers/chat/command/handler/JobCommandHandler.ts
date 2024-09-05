import Character from "@breakEmu_API/model/character.model"
import Experience from "@breakEmu_API/model/experience.model"
import Logger from "@breakEmu_Core/Logger"
import WorldServer from "@breakEmu_World/WorldServer"
import AccountRoleEnum from "../../../../enum/AccountRoleEnum"
import CommandHandler, { TCommandHandler } from "../CommandHandler"
import Container from "@breakEmu_Core/container/Container"

class JobCommandHandler {
	static logger: Logger = new Logger("JobCommandHandler")
	public static container: Container = Container.getInstance()

	static commandHandler: TCommandHandler = {
		job: {
			execute: async (args, message, character) => {
				await this.container
					.get(CommandHandler)
					.helpCommand(character, this.commandHandler)
			},
			description: "",
			command: "job",
			neededRole: [AccountRoleEnum.MODERATOR],
			show: true,
			nbRequiredArgs: 0,
			asHelp: true,
			hasSubCommands: true,
			subCommandHandlers: {
				addexp: {
					execute: async (args, message, character) => {
						await this.experienceHandler(
							parseInt(args[0]),
							parseInt(args[1]),
							parseInt(args[2]),
							character
						)
					},
					description: "Add level to a job",
					command: "addexp",
					neededRole: [AccountRoleEnum.MODERATOR],
					show: true,
					nbRequiredArgs: 2,
					requiredArgs: ["charatcerId", "jobId", "experience"],
				},
			},
		},
	}

	private static async experienceHandler(
		characterId: number,
		jobId: number,
		experience: number,
		commandCaster: Character
	) {
		const clients = this.container.get(WorldServer).clients.values()

		for (const client of clients) {
			const character = client.selectedCharacter

			if (character.id == characterId) {
				if (!experience) {
					await commandCaster.replyError("Level not found")
					return
				}

				this.logger.write(`Adding ${experience}`)

				await character.addJobExperience(jobId, experience)
				await commandCaster.reply(
					`added ${experience} exp to character ${character.name}`
				)

				return
			} else {
				await commandCaster.replyError("Character not found")
				return
			}
		}
	}
}

export default JobCommandHandler
