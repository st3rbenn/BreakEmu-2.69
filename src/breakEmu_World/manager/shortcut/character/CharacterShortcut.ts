import {Shortcut} from '../../../../breakEmu_Server/IO'


abstract class CharacterShortcut {
  public _slotId: number
  public _barType: number

  constructor(slotId: number, barType: number) {
    this._slotId = slotId
    this._barType = barType
  }

  public get slotId(): number {
    return this._slotId
  }

  public set slotId(slotId: number) {
    this._slotId = slotId
  }

  public get barType(): number {
    return this._barType
  }

  public set barType(barType: number) {
    this._barType = barType
  }

  public abstract getShortcut(): Shortcut
}

export default CharacterShortcut