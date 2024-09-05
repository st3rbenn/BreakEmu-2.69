import LimitCharacteristic from "./limitCharacteristic";
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager";

class ApCharacteristic extends LimitCharacteristic {
  public override get limit(): number {
    return this.container.get(ConfigurationManager).apLimit
  }

  public override get contextLimit(): boolean {
    return false
  }

  public static new(base: number): ApCharacteristic {
    return new ApCharacteristic(base)
  }
}

export default ApCharacteristic