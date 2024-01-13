import { CharacterCharacteristicDetailed, CharacteristicEnum } from "../../../../breakEmu_Server/IO";
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
    return this._relativ!.Total() / 10
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