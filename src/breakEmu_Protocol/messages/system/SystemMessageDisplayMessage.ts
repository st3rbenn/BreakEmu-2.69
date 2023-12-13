import ICustomDataInput from "breakEmu_Server/IO/interface/ICustomDataInput"
import Message from "../../../breakEmu_Server/IO/message/Message"
import ICustomDataOutput from "breakEmu_Server/IO/interface/ICustomDataOutput"

class SystemMessageDisplayMessage extends Message {
	public MessageId: number = 6724

	public hangUp: boolean = false
	public msgId: number = 0
	public parameters: string[]

	constructor(
		hangUp: boolean = false,
		msgId: number = 0,
		parameters: string[] = []
	) {
		super()
		this.hangUp = hangUp
		this.msgId = msgId
		this.parameters = parameters
	}

	public Serialize(writer: ICustomDataOutput): void {
		writer.WriteBoolean(this.hangUp)
		writer.WriteVarShort(this.msgId)
		writer.WriteShort(this.parameters.length)
		for (let i = 0; i < this.parameters.length; i++) {
			writer.WriteUTF(this.parameters[i])
		}
	}
	public Deserialize(reader: ICustomDataInput): void {
		this.hangUp = reader.ReadBoolean()
		this.msgId = reader.ReadVarShort()
		const parametersLen = reader.ReadShort()
		this.parameters = []
		for (let i = 0; i < parametersLen; i++) {
			this.parameters.push(reader.ReadUTF())
		}
	}
}

export default SystemMessageDisplayMessage
