import Character from "@breakEmu_API/model/character.model"
import { DialogTypeEnum, ExchangeLeaveMessage, ExchangeTypeEnum } from "@breakEmu_Protocol/IO"
import Dialog from "../dialog/Dialog"

abstract class Exchange extends Dialog {

  success: boolean = false

  dialogType: DialogTypeEnum = DialogTypeEnum.DIALOG_EXCHANGE

  EchangeType: ExchangeTypeEnum

  constructor(character: Character) {
    super()
    this.character = character
  }

  
  override async close(): Promise<void> {
    await this.character.client.Send(new ExchangeLeaveMessage(
      DialogTypeEnum.DIALOG_EXCHANGE,
      this.success
    ))
    this.character.removeDialog()
  }



  public abstract moveItemPriced(objectUID: number, quantity: number, price: number): void;

  public abstract modifyItemPriced(objectUID: number, quantity: number, price: number): void;

  public abstract moveItem(objectUID: number, quantity: number): void;

  public abstract ready(ready: boolean, step: number): void;

  public abstract moveKamas(quantity: number): void;

  // public abstract onNpcGenericAction(action: NpcActionsEnum): void;
}

export default Exchange