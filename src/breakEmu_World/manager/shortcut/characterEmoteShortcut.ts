import { Shortcut, ShortcutEmote } from "../../../breakEmu_Server/IO";
import CharacterShortcut from "./characterShortcut";

class CharacterEmoteShortcut extends CharacterShortcut {
  public _emoteId: number

  constructor(slotId: number, emoteId: number) {
    super(slotId)

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