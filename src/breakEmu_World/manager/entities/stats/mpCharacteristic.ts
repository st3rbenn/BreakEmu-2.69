import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import LimitCharacteristic from "./limitCharacteristic"

class MpCharacteristic extends LimitCharacteristic {
  public override get limit(): number {
    return ConfigurationManager.getInstance().apLimit
  }

  public override get contextLimit(): boolean {
    return false
  }

  public static new(base: number): MpCharacteristic {
    return new MpCharacteristic(base)
  }
}

export default MpCharacteristic