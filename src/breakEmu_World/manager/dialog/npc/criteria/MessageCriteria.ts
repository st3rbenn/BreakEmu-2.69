import ComparaisonOperatorEnum from "@breakEmu_World/manager/achievement/objective/objectiveCriterion/ComparaisonOperatorEnum"

abstract class MessageCriteria {
  static identifier: string
	comparator: ComparaisonOperatorEnum

	public constructor(compare: ComparaisonOperatorEnum) {
		this.comparator = compare
	}

  abstract handleCriteriaResultValue(): string
}

export default MessageCriteria