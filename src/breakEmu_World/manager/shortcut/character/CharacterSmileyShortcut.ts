import { Shortcut, ShortcutSmiley } from "@breakEmu_Server/IO";
import CharacterShortcut from "./CharacterShortcut";

class CharacterSmileyShortcut extends CharacterShortcut {
  private _smileyId: number

  constructor(slotId: number, smileyId: number, barType: number) {
    super(slotId, barType)

    this._smileyId = smileyId
  }

  public get smileyId(): number {
    return this._smileyId
  }

  public set smileyId(smileyId: number) {
    this._smileyId = smileyId
  }

  public override getShortcut(): Shortcut {
    return new ShortcutSmiley(this.slotId, this.smileyId)
  }
}