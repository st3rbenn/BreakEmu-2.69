import RelativeCharacteristic from "./relativeCharacteristic";

class PointDodgeCharacteristic extends RelativeCharacteristic {

  public override get base(): number {
    return super.base
  }

  public override set base(base: number) {
    super.base = base
  }

  public override get additional(): number {
    return super.additional
  }

  public override set additional(additional: number) {
    super.additional = additional
  }

  public override get objects(): number {
    return super.objects
  }

  public override set objects(objects: number) {
    super.objects = objects
  }

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