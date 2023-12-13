import ICustomDataInput from "breakEmu_Server/IO/interface/ICustomDataInput"
import ICustomDataOutput from "breakEmu_Server/IO/interface/ICustomDataOutput"
import Message from "../../../breakEmu_Server/IO/message/Message"

class IdentificationFailedMessage extends Message {
	public MessageId: number = 4905
	public reason: number = 99

	getMessageId(): number {
		return 4905
	}

	pack(output: ICustomDataOutput): void {
		this.Serialize(output)
	}

	Serialize(output: ICustomDataOutput): void {
		output.WriteByte(this.reason)
	}

	public Deserialize(reader: ICustomDataInput): void {
		throw new Error("Method not implemented.")
	}

	deserialize(input: ICustomDataInput): void {
		this.reason = input.ReadByte()
		if (this.reason < 0) {
			throw new Error(
				"Forbidden value (" +
					this.reason +
					") on element of IdentificationFailedMessage.reason."
			)
		}
	}
}

export default IdentificationFailedMessage
