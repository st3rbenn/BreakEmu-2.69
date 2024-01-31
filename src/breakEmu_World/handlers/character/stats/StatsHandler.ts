import Logger from "../../../../breakEmu_Core/Logger"
import {
	StatsUpgradeRequestMessage,
	StatsBoostEnum,
	StatsUpgradeResultEnum,
} from "../../../../breakEmu_Server/IO"
import WorldClient from "../../../WorldClient"

class StatsHandler {
	private static logger: Logger = new Logger("StatsHandler")

	public static async handlerStatsUpgradeRequestMessage(
		message: StatsUpgradeRequestMessage,
		client: WorldClient
	) {
		this.logger.write("StatsUpgradeRequestMessage")
		//   if (!client.selectedCharacter?.fighting) {
		// } else {
		//     client.character.onStatUpgradeResult(StatsUpgradeResultEnum.IN_FIGHT, 0);
		// }
		if (client.selectedCharacter) {
			const { boostPoint, useAdditionnal } = message
			const statId = message.statId as StatsBoostEnum
			const characteristic = client.selectedCharacter.stats.getCharacteristicToBoost(
				statId
			)

			if (characteristic === null) {
				client.selectedCharacter.replyError("Wrong StatId.")
				client.selectedCharacter.onStatUpgradeResult(
					StatsUpgradeResultEnum.NONE,
					message.boostPoint as number
				)
				return
			}

			if ((boostPoint as number) > 0) {
				let num = characteristic.base
				let num2 = message.boostPoint as number

				if (
					num2 >= 1 &&
					(boostPoint as number) <= client.selectedCharacter.statsPoints
				) {
					const upgradeCosts = client.selectedCharacter.breed.getStatUpgradeCost(
						statId
					)
					let thresholdIndex = client.selectedCharacter.breed.getStatUpgradeCostIndex(
						num,
						upgradeCosts
					)

					while (num2 >= upgradeCosts[thresholdIndex].cost) {
						let num3: number
						let num4: number

						if (
							thresholdIndex < upgradeCosts.length - 1 &&
							num2 / upgradeCosts[thresholdIndex].cost >
								upgradeCosts[thresholdIndex + 1].until - num
						) {
							num3 = upgradeCosts[thresholdIndex + 1].until - num
							num4 = num3 * upgradeCosts[thresholdIndex].cost
						} else {
							num3 = Math.floor(num2 / upgradeCosts[thresholdIndex].cost)
							num4 = num3 * upgradeCosts[thresholdIndex].cost
						}

						num += num3
						num2 -= num4
						thresholdIndex = client.selectedCharacter.breed.getStatUpgradeCostIndex(
							num,
							upgradeCosts
						)
					}

					if (statId === StatsBoostEnum.VITALITY) {
						const num5 = num - characteristic.base
						client.selectedCharacter.stats.lifePoints += num5
						client.selectedCharacter.stats.maxLifePoints += num5
					}

					characteristic.base = num
					client.selectedCharacter.statsPoints -= (boostPoint as number) - num2
					client.selectedCharacter.onStatUpgradeResult(
						StatsUpgradeResultEnum.SUCCESS,
						message.boostPoint as number
					)
					client.selectedCharacter.refreshStats()
				} else {
					client.selectedCharacter.onStatUpgradeResult(
						StatsUpgradeResultEnum.NOT_ENOUGH_POINT,
						message.boostPoint as number
					)
				}
			}
		}
	}
}

export default StatsHandler
