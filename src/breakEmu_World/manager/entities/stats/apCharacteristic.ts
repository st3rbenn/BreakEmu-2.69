import LimitCharacteristic from "./limitCharacteristic";
import ConfigurationManager from "../../../../breakEmu_Core/configuration/ConfigurationManager";

class ApCharacteristic extends LimitCharacteristic {
  public override get limit(): number {
    return ConfigurationManager.getInstance().apLimit
  }

  public override get contextLimit(): boolean {
    return false
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

  public static new(base: number): ApCharacteristic {
    return new ApCharacteristic(base)
  }
}

export default ApCharacteristic