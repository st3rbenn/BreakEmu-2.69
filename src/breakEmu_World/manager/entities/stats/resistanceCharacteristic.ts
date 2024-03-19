import LimitCharacteristic from './limitCharacteristic';

class ResistanceCharacteristic extends LimitCharacteristic {
  public _resistanceLimit: number = 50

  public override get limit(): number {
    return this._resistanceLimit
  }

  public override get contextLimit(): boolean {
    return true
  }

  public static new(base: number): ResistanceCharacteristic {
    return new ResistanceCharacteristic(base)
  }

  public static zero(): ResistanceCharacteristic {
    return new ResistanceCharacteristic(0)
  }
}

export default ResistanceCharacteristic