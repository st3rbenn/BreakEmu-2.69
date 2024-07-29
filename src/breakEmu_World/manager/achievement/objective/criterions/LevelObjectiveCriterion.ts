import Character from "../../../../../breakEmu_API/model/character.model";
import ComparaisonOperatorEnum from "../objectiveCriterion/ComparaisonOperatorEnum";
import ObjectiveCriterion from "../objectiveCriterion/ObjectiveCriterion";

class LevelObjectiveCriterion extends ObjectiveCriterion {
    public static readonly identifier: string = "PL";
    characterLevel: number;
    criterionLevel: number;

    constructor(character: Character, level: number, compare: ComparaisonOperatorEnum) {
      super(compare);
        this.characterLevel = character.level;
        this.criterionLevel = level;
    }

    public override criterionFulfilled = () => this.compare();

    private compare(): boolean {
      console.log(`Character level: ${this.characterLevel}, Criterion level: ${this.criterionLevel}, Comparator: ${this.comparator}`);
      switch (this.comparator) {
        case ComparaisonOperatorEnum.EQUALS:
            return this.characterLevel == this.criterionLevel;
        case ComparaisonOperatorEnum.SUPERIOR:
            return this.characterLevel > this.criterionLevel;
        default:
            return false;
      }
    }
}

export default LevelObjectiveCriterion