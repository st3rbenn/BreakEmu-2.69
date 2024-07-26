import {
	AchievementAchievedRewardable,
	AchievementDetailedListMessage,
	AchievementDetailedListRequestMessage,
	AchievementDetailsMessage,
	AchievementDetailsRequestMessage,
	AchievementFinishedMessage,
} from "../../../breakEmu_Server/IO"
import Logger from "../../../breakEmu_Core/Logger"
import WorldClient from "../../../breakEmu_World/WorldClient"
import Achievement from "../../../breakEmu_API/model/achievement.model"
import AchievementManager from "../../../breakEmu_World/manager/achievement/AchievementManager"
import Character from "breakEmu_API/model/character.model"

class AchievementHandler {
	private static logger: Logger = new Logger("AchievementHandler")

	public static async handleAchievementAlmostFinishedDetailedListRequestMessage(
		client: WorldClient
	) {
		await client.Send(new AchievementDetailedListMessage([], []))
	}

	public static async handleAchievementDetailedListRequestMessage(
		client: WorldClient,
		message: AchievementDetailedListRequestMessage
	) {
		console.log("Achivement category Id: " + message.categoryId)
		await client.Send(new AchievementDetailedListMessage([], []))
	}

	public static async handleAchievementDetailsRequestMessage(
		client: WorldClient,
		message: AchievementDetailsRequestMessage
	) {
		const achivement = AchievementManager.achievements.get(
			message.achievementId as number
		)
		console.log("ACHIVEMENT DETAILS: ", achivement)
		if (achivement) {
			await client.Send(
				new AchievementDetailsMessage(achivement.toAchivementMessage())
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
}

export default AchievementHandler
