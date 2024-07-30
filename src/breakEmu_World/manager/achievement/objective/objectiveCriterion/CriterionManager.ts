import AchievementObjectiveHandler from "../AchievementObjectiveHandler"
import LevelObjectiveCriterion from "../criterions/LevelObjectiveCriterion"
import ComparaisonOperatorEnum from "./ComparaisonOperatorEnum"
import ObjectiveCriterion from "./ObjectiveCriterion"
import AchievementItemCriterion from "../criterions/AchievementItemCriterion"
import JobItemCriterion from "../criterions/JobItemCriterion"

class CriterionManager {
	criterion: string
	objective: AchievementObjectiveHandler

	constructor(objective: AchievementObjectiveHandler) {
		this.objective = objective
		this.criterion = objective.achievementObjective.criterion
	}

	generateCriterion(): ObjectiveCriterion[] {
		// console.log(this.objective)
		let listOfCriterion: ObjectiveCriterion[] = []
		console.log("criteron", this.criterion)
		let identifiers = this.criterion.split("&")
			? this.criterion.split("&")
			: this.criterion.split("")

		if (identifiers.length > 0) {
			for (const identifier of identifiers) {
				const operatorType = this.GetSplitOperator(identifier)
				const operatorString = this.GetOperatorByType(operatorType)

				const splitted = this.removeParanthesis(identifier).split(
					operatorString
				)
				const id = splitted[0]
				const params = splitted[1].split(",")

				console.log(id, params)

				switch (id) {
					case LevelObjectiveCriterion.identifier:
						listOfCriterion.push(
							new LevelObjectiveCriterion(
								this.objective.character,
								parseInt(this.arrayFirstorDefault(params, "0")),
								operatorType
							)
						)
						break
					case AchievementItemCriterion.identifier:
						listOfCriterion.push(
							new AchievementItemCriterion(
								this.objective.character,
								parseInt(this.arrayFirstorDefault(params, "0")),
								operatorType
							)
						)
						break
					case JobItemCriterion.firstIdentifier:
					case JobItemCriterion.secondIdentifier:
						listOfCriterion.push(new JobItemCriterion(this.objective.character, operatorType))
						break
					default:
						console.log("Unknown criterion identifier: " + id)
				}
			}

			return listOfCriterion
		}

		return listOfCriterion
	}

	private GetSplitOperator(identifier: string): ComparaisonOperatorEnum {
		if (identifier.includes(">") || identifier.includes("<")) {
			return ComparaisonOperatorEnum.SUPERIOR
		}
		return ComparaisonOperatorEnum.EQUALS
	}

	private GetOperatorByType(type: ComparaisonOperatorEnum): string {
		if (type == ComparaisonOperatorEnum.SUPERIOR) return ">"
		return "="
	}

	private removeParanthesis(str: string): string {
		return str.replace(/\(/g, "").replace(/\)/g, "")
	}

	private arrayFirstorDefault<T>(array: T[], defaultValue: T): T {
		return array.length > 0 ? array[0] : defaultValue
	}
}

export default CriterionManager
