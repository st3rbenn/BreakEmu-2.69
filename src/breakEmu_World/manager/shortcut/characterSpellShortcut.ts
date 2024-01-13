import { Shortcut, ShortcutSpell } from "../../../breakEmu_Server/IO";
import CharacterShortcut from "./characterShortcut";

class CharacterSpellShortcut extends CharacterShortcut {
  private _spellId: number

  constructor(slotId: number, spellId: number) {
    super(slotId)

    this._spellId = spellId
  }

  public get spellId(): number {
    return this._spellId
  }

  public set spellId(spellId: number) {
    this._spellId = spellId
  }

  public override getShortcut(): Shortcut {
    return new ShortcutSpell(this.slotId, this.spellId)
  }
}