import ComparaisonOperatorEnum from "./ComparaisonOperatorEnum"

class ObjectiveCriterion {
	comparator: ComparaisonOperatorEnum

	public constructor(compare: ComparaisonOperatorEnum) {
		this.comparator = compare
	}

	public criterionFulfilled = () => false
}

export default ObjectiveCriterion
