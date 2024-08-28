import Character from "@breakEmu_API/model/character.model"
import ComparaisonOperatorEnum from "../objectiveCriterion/ComparaisonOperatorEnum"
import ObjectiveCriterion from "../objectiveCriterion/ObjectiveCriterion"

class JobItemCriterion extends ObjectiveCriterion {
	public static readonly firstIdentifier: string = "PJ"
	public static readonly secondIdentifier: string = "Pj"

  character: Character

	constructor(character: Character, compare: ComparaisonOperatorEnum) {
		super(compare)
    this.character = character
	}
}

export default JobItemCriterion
