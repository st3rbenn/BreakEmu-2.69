import Characteristic from "./characteristic";
import LimitCharacteristic from "./limitCharacteristic";

class RangeCharacteristic extends LimitCharacteristic {
  public _rangelimit: number = 6

  public override get limit(): number {
    return this._rangelimit
  }

  public override get contextLimit(): boolean {
    return true
  }

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

  public static new(base: number): RangeCharacteristic {
    return new RangeCharacteristic(base)
  }
  
  public static zero(): Characteristic {
    return new RangeCharacteristic(0)
  }
}

export default RangeCharacteristic;