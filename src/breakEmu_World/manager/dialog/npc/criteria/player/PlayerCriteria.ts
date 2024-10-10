import Character from "@breakEmu_API/model/character.model"
import MessageCriteria from "../MessageCriteria"
import ComparaisonOperatorEnum from "@breakEmu_World/manager/achievement/objective/objectiveCriterion/ComparaisonOperatorEnum"
import Logger from "@breakEmu_Core/Logger"

class PlayerCriteria extends MessageCriteria {
	logger: Logger = new Logger("PlayerCriteria")
	static identifier: string = "PA"
	character: Character
	subCriteriaIdentifier: string

	constructor(
		character: Character,
		subCriteriaIdentifier: string,
		operator: ComparaisonOperatorEnum
	) {
		super(operator)
		this.subCriteriaIdentifier = subCriteriaIdentifier
		this.character = character
	}

	handleCriteriaResultValue(): string {
		let result = ""
		switch (this.subCriteriaIdentifier) {
			case "Na":
				result = this.character.name
				break
			case "Le":
				result = this.character.level.toString()
				break
			case "Id":
				result = this.character.id.toString()
				break
			default:
				this.logger.error(
					"Unknown player criteria identifier: " + this.subCriteriaIdentifier
				)
		}
		return result
	}
}

export default PlayerCriteria
