import Characteristic from "./characteristic"

abstract class LimitCharacteristic extends Characteristic {

  public abstract get limit(): number
  public abstract get contextLimit(): boolean

  public override Total(): number {
    const total = super.Total()
    return total > this.limit ? this.limit : total  
  }

  public override TotalInContext(): number {
    if(this.contextLimit) {
      return this.Total() + this.context
    } else {
      return super.TotalInContext()
    }
  }
}

export default LimitCharacteristic;