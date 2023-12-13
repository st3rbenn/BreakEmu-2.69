import ICustomDataInput from "breakEmu_Server/IO/interface/ICustomDataInput"
import ICustomDataOutput from "breakEmu_Server/IO/interface/ICustomDataOutput"
import Message from "../../../breakEmu_Server/IO/message/Message"

class CredentialsAcknowledgementMessage extends Message {
	public MessageId: number = 4271
	getMessageId(): number {
		return 4271
	}

	Serialize(writer: ICustomDataOutput): void {}

	public Deserialize(reader: ICustomDataInput): void {
		throw new Error("Method not implemented.")
	}
}

export default CredentialsAcknowledgementMessage
