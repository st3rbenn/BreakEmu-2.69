import LimitCharacteristic from './limitCharacteristic';

class ResistanceCharacteristic extends LimitCharacteristic {
  public _resistanceLimit: number = 50

  public override get limit(): number {
    return this._resistanceLimit
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

  public static new(base: number): ResistanceCharacteristic {
    return new ResistanceCharacteristic(base)
  }

  public static zero(): ResistanceCharacteristic {
    return new ResistanceCharacteristic(0)
  }
}

export default ResistanceCharacteristic