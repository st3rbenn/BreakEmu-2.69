import { Shortcut, ShortcutSpell } from "@breakEmu_Protocol/IO";
import CharacterShortcut from "./CharacterShortcut";

class CharacterSpellShortcut extends CharacterShortcut {
  private _spellId: number

  constructor(slotId: number, spellId: number, barType: number) {
    super(slotId, barType)

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

export default CharacterSpellShortcut