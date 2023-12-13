import ICustomDataInput from "breakEmu_Server/IO/interface/ICustomDataInput"
import ICustomDataOutput from "../../../breakEmu_Server/IO/interface/ICustomDataOutput"
import Message from "../../../breakEmu_Server/IO/message/Message"


class ProtocolRequired extends Message {
  public MessageId: number = 6212
	public version: string

	constructor(version: string) {
    super()
		this.version = version
	}

	public getMessageId(): number {
		return 6212
	}
  public override async Serialize(writer: ICustomDataOutput): Promise<void> {
    await writer.WriteUTF(this.version);
}
  public override Deserialize(reader: ICustomDataInput): void {
    this.version = reader.ReadUTF()
  }
}

export default ProtocolRequired
