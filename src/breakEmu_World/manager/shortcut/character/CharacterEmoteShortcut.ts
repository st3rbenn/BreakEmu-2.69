import { Shortcut, ShortcutEmote } from "../../../../breakEmu_Server/IO";
import CharacterShortcut from "./CharacterShortcut";

class CharacterEmoteShortcut extends CharacterShortcut {
  public _emoteId: number

  constructor(slotId: number, emoteId: number, barType: number) {
    super(slotId, barType)

    this._emoteId = emoteId
  }

  public get emoteId(): number {
    return this._emoteId
  }

  public set emoteId(emoteId: number) {
    this._emoteId = emoteId
  }

  public override getShortcut(): Shortcut {
    return new ShortcutEmote(this.slotId, this.emoteId)
  }
}