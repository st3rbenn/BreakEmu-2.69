class AchievementReward {
  id: number
  criteria: string
  kamasRatio: number
  experienceRatio: number
  kamasScaleWithPlayerLevel: boolean
  itemsReward: number[]
  ItemsQuantityReward: number[]
  emotesReward: number[]
  titlesReward: number[]
  ornamentsReward: number[]

  constructor(
    id: number,
    criteria: string,
    kamasRatio: number,
    experienceRatio: number,
    kamasScaleWithPlayerLevel: boolean,
    itemsReward: number[],
    ItemsQuantityReward: number[],
    emotesReward: number[],
    titlesReward: number[],
    ornamentsReward: number[]
  ) {
    this.id = id
    this.criteria = criteria
    this.kamasRatio = kamasRatio
    this.experienceRatio = experienceRatio
    this.kamasScaleWithPlayerLevel = kamasScaleWithPlayerLevel
    this.itemsReward = itemsReward
    this.ItemsQuantityReward = ItemsQuantityReward
    this.emotesReward = emotesReward
    this.titlesReward = titlesReward
    this.ornamentsReward = ornamentsReward
  }
}

export default AchievementReward
