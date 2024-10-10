import Character from "@breakEmu_API/model/character.model"
import ComparaisonOperatorEnum from "@breakEmu_World/manager/achievement/objective/objectiveCriterion/ComparaisonOperatorEnum"
import MessageCriteria from "./MessageCriteria"
import PlayerCriteria from "./player/PlayerCriteria"

class MessageCriteriaManager {
	criteria: string
	character: Character

	constructor(criteria: string, character: Character) {
		this.criteria = criteria
		this.character = character
	}

	generateCriteria(): MessageCriteria[] {
		let listOfCriteria: MessageCriteria[] = []
		let identifiers = this.criteria.split("&")
			? this.criteria.split("&")
			: this.criteria.split("")

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
					case PlayerCriteria.identifier:
						listOfCriteria.push(
							new PlayerCriteria(
								this.character,
								this.arrayFirstorDefault(params, "0"),
								operatorType
							)
						)
						break
					default:
						console.log("Unknown criterion identifier: " + id)
				}
			}

			return listOfCriteria
		}

		return listOfCriteria
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

export default MessageCriteriaManager
