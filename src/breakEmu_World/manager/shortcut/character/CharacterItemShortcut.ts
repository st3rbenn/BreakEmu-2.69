import { Shortcut, ShortcutObjectItem } from "@breakEmu_Protocol/IO";
import CharacterShortcut from "./CharacterShortcut";

class CharacterItemShortcut extends CharacterShortcut {
  private _itemUid: number
  private _itemGid: number

  constructor(slotId: number, itemUid: number, itemGid: number, barType: number) {
    super(slotId, barType)

    this._itemUid = itemUid
    this._itemGid = itemGid
  }

  public get itemUid(): number {
    return this._itemUid
  }

  public set itemUid(itemUid: number) {
    this._itemUid = itemUid
  }

  public get itemGid(): number {
    return this._itemGid
  }

  public set itemGid(itemGid: number) {
    this._itemGid = itemGid
  }

  public override getShortcut(): Shortcut {
    return new ShortcutObjectItem(
      this.slotId,
      this.itemUid,
      this.itemGid
    )
  }
}

export default CharacterItemShortcut;