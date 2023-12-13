import ICustomDataInput from "breakEmu_Server/IO/interface/ICustomDataInput"
import ICustomDataOutput from "breakEmu_Server/IO/interface/ICustomDataOutput"
import Message from "../../../breakEmu_Server/IO/message/Message"

class HelloConnectMessage extends Message {
	public MessageId: number = 7439
	public salt: string = ""
	public key: number[]

	constructor(salt: string = "", key: number[] = []) {
		super()
		this.salt = salt
		this.key = key
	}

	Serialize(output: ICustomDataOutput) {
		output.WriteUTF(this.salt)
		output.WriteVarInt(this.key.length)
		for (let i = 0; i < this.key.length; i++) {
			output.WriteByte(this.key[i])
		}
	}

	Deserialize(input: ICustomDataInput) {
		this.salt = input.ReadUTF()
		const keyLen = input.ReadVarInt()
		this.key = []
		for (let i = 0; i < keyLen; i++) {
			this.key.push(input.ReadByte())
		}
	}

	getMessageId() {
		return 7439
	}
}

export default HelloConnectMessage
