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

  

  public static new(base: number): RangeCharacteristic {
    return new RangeCharacteristic(base)
  }
  
  public static zero(): Characteristic {
    return new RangeCharacteristic(0)
  }
}

export default RangeCharacteristic;