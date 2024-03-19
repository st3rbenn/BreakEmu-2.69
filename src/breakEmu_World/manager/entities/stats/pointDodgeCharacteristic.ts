import RelativeCharacteristic from "./relativeCharacteristic";

class PointDodgeCharacteristic extends RelativeCharacteristic {

  public override Total(): number {
    let total: number = super.Total()
    return total > 0 ? total : 0
  }

  public override TotalInContext(): number {
    let totalInContext: number = super.TotalInContext()
    return totalInContext > 0 ? totalInContext : 0
  }

  public static new(base: number): PointDodgeCharacteristic {
    return new PointDodgeCharacteristic(base)
  }
}

export default PointDodgeCharacteristic