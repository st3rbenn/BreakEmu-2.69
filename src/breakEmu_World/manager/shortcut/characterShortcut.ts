import {Shortcut} from '../../../breakEmu_Server/IO'


abstract class CharacterShortcut {
  public _slotId: number

  constructor(slotId: number) {
    this._slotId = slotId
  }

  public get slotId(): number {
    return this._slotId
  }

  public set slotId(slotId: number) {
    this._slotId = slotId
  }

  public abstract getShortcut(): Shortcut
}

export default CharacterShortcut