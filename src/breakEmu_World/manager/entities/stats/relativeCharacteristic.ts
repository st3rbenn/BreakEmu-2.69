import { CharacterCharacteristicDetailed, CharacteristicEnum } from "@breakEmu_Protocol/IO";
import Characteristic from "./characteristic";

class RelativeCharacteristic extends Characteristic {
  private _relativ: Characteristic | null

  constructor(base: number, additional: number = 0, objects: number = 0, context: number = 0, relativ: Characteristic | null = null) {
    super(base, additional, objects, context)
    this._relativ = relativ
  }

  protected get relativ(): Characteristic | null {
    return this._relativ
  }

  protected set relativ(relativ: Characteristic) {
    this._relativ = relativ
  }

  public relativDelta(): number {
    return this._relativ ? (this.base + this.additional + this.objects) / 10 : 0
  }

  

  public bind(characteristic: Characteristic): void {
    this._relativ = characteristic
  }

  public override characterCharacteristicDetailed(characteristic: CharacteristicEnum): CharacterCharacteristicDetailed {
    return new CharacterCharacteristicDetailed(characteristic, this.base + this.relativDelta(), this.additional, this.objects, this.context, this.context)
  }

  public static zero(): RelativeCharacteristic {
    return new RelativeCharacteristic(0)
  }

  public static new(base: number): RelativeCharacteristic {
    return new RelativeCharacteristic(base, 0, 0, 0, null)
  }
}

export default RelativeCharacteristic