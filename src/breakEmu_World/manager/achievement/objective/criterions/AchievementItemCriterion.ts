import Character from "@breakEmu_API/model/character.model";
import ComparaisonOperatorEnum from "../objectiveCriterion/ComparaisonOperatorEnum";
import ObjectiveCriterion from "../objectiveCriterion/ObjectiveCriterion"

class AchievementItemCriterion extends ObjectiveCriterion {
  public static readonly identifier: string = 'OA'
  character: Character
  achievementId: number

  constructor(character: Character, achievementId: number,  compare: ComparaisonOperatorEnum) {
    super(compare);
    this.character = character;
    this.achievementId = achievementId;
  }

  public override criterionFulfilled = () => this.compare();

  private compare(): boolean {
    const finishedAchievements = this.character.finishedAchievements;

    for(const achievement of finishedAchievements) {
      if(achievement === this.achievementId) {
        return true;
      }
    }

    return false;
  }
}

export default AchievementItemCriterion