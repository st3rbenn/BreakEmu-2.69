import Character from "../../../breakEmu_API/model/character.model"
import { DialogTypeEnum, ExchangeLeaveMessage } from "../../../breakEmu_Server/IO"
import Dialog from "../dialog/Dialog"

abstract class Exchange extends Dialog {

  success: boolean = false

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
}

export default Exchange