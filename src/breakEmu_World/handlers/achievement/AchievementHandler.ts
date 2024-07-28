import {
	AchievementAchieved,
	AchievementAchievedRewardable,
	AchievementDetailedListMessage,
	AchievementDetailedListRequestMessage,
	AchievementDetailsMessage,
	AchievementDetailsRequestMessage,
	AchievementFinishedMessage,
	AchievementListMessage,
	Achievement as AchievementMessage,
	AchievementRewardErrorMessage,
	AchievementRewardRequestMessage,
	AchievementRewardSuccessMessage,
} from "../../../breakEmu_Server/IO"
import Logger from "../../../breakEmu_Core/Logger"
import WorldClient from "../../../breakEmu_World/WorldClient"
import Achievement from "../../../breakEmu_API/model/achievement.model"
import AchievementManager from "../../../breakEmu_World/manager/achievement/AchievementManager"
import Character from "../../../breakEmu_API/model/character.model"

class AchievementHandler {
	private static logger: Logger = new Logger("AchievementHandler")

	public static async handleAchievementListMessage(character: Character) {
		const achievedAchievements: AchievementAchieved[] = []

		for (const achievementId of character.finishedAchievements) {
			const achievement = AchievementManager.achievements.get(achievementId)
			if (achievement) {
				achievedAchievements.push(achievement.toAchievementAchieved(character))
			}
		}

		await character?.client?.Send(
			new AchievementListMessage(achievedAchievements)
		)
	}

	public static async handleAchievementAlmostFinishedDetailedListRequestMessage(
		client: WorldClient
	) {}

	public static async handleAchievementDetailedListRequestMessage(
		client: WorldClient,
		message: AchievementDetailedListRequestMessage
	) {
		let achievementByCategory = AchievementManager.getInstance().getAchievementsByCategoryId(
			message.categoryId as number
		)

		if (achievementByCategory.length > 0) {
			let finishedAchievements: AchievementMessage[] = []

			achievementByCategory.map((achievement: Achievement) => {
				if (
					client.selectedCharacter.finishedAchievements.includes(achievement.id)
				) {
					finishedAchievements.push(
						achievement.toAchievementMessage(client.selectedCharacter)
					)
				}
			})
			client.Send(new AchievementDetailedListMessage([], finishedAchievements))
		}
	}

	public static async handleAchievementDetailsRequestMessage(
		client: WorldClient,
		message: AchievementDetailsRequestMessage
	) {
		const achivement = AchievementManager.achievements.get(
			message.achievementId as number
		)
		if (achivement) {
			await client.Send(
				new AchievementDetailsMessage(
					achivement.toAchievementMessage(client.selectedCharacter)
				)
			)
		}
	}

	public static async handleSendAchievementFinishedMessage(
		character: Character,
		achievement: Achievement
	) {
		await character.client.Send(
			new AchievementFinishedMessage(
				new AchievementAchievedRewardable(
					achievement.id,
					character.id,
					character.level
				)
			)
		)
	}

	public static async handleAchievementRewardRequestMessage(
		client: WorldClient,
		message: AchievementRewardRequestMessage
	) {
		try {
			const achievement = AchievementManager.achievements.get(
				message.achievementId as number
			)

			if (message.achievementId && message.achievementId > 0) {
				if (achievement) {
					await AchievementManager.getInstance().rewardAchievement(
						client.selectedCharacter,
						achievement
					)

					if (
						client.selectedCharacter.finishedAchievements.includes(
							achievement.id
						)
					) {
						await this.sendAchievementRewardSuccessMessage(
							client,
							achievement.id
						)
						await client.selectedCharacter.refreshStats()
					}
				}
			} else {
				const finishedAchievements = Array.from(
					AchievementManager.achievements.values()
				).filter((achievement) =>
					client.selectedCharacter.untakenAchievementsReward.includes(
						achievement.id
					)
				)

				for (const achievement of finishedAchievements) {
					await AchievementManager.getInstance().rewardAchievement(
						client.selectedCharacter,
						achievement
					)
					await this.sendAchievementRewardSuccessMessage(client, achievement.id)
				}
			}
		} catch (error) {
			this.logger.write(
				`Error while handling AchievementRewardRequestMessage: ${
					(error as any).stack
				}`
			)
			await this.sendAchievementRewardErrorMessage(
				client,
				message.achievementId as number
			)
		}
	}

	public static async sendAchievementRewardSuccessMessage(
		client: WorldClient,
		achievementId: number
	) {
		try {
			await client.Send(new AchievementRewardSuccessMessage(achievementId))
		} catch (error) {
			this.logger.write(
				`Error while sending AchievementRewardSuccessMessage: ${
					(error as any).stack
				}`
			)
		}
	}

	public static async sendAchievementRewardErrorMessage(
		client: WorldClient,
		achievementId: number
	) {
		try {
			await client.Send(new AchievementRewardErrorMessage(achievementId))
		} catch (error) {
			this.logger.write(
				`Error while sending AchievementRewardSuccessMessage: ${
					(error as any).stack
				}`
			)
		}
	}
}

export default AchievementHandler
