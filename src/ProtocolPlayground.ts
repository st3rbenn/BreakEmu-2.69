import SystemMessageDisplayMessage from './breakEmu_Protocol/messages/system/SystemMessageDisplayMessage';
import RSAKeyHandler from "./breakEmu_Core/RSAKeyHandler"
import CustomDataWriter from "./breakEmu_Server/IO/CustomDataWriter"
import HelloConnectMessage from "./breakEmu_Protocol/messages/connection/HelloConnectMessage"
import ICustomDataOutput from "./breakEmu_Server/IO/interface/ICustomDataOutput"
import Logger from "./breakEmu_Core/Logger"
import Message from './breakEmu_Server/IO/message/Message';

class ProtocolPlayground {
	public logger: Logger = new Logger("ProtocolPlayground")

	messageId: number = 7439

	private static _instance: ProtocolPlayground

	public static getInstance(): ProtocolPlayground {
		if (!ProtocolPlayground._instance) {
			ProtocolPlayground._instance = new ProtocolPlayground()
		}

		return ProtocolPlayground._instance
	}

	public async main(): Promise<void> {
		const privKey = RSAKeyHandler.getInstance().rsaPubKey
		const arrayBuff = Buffer.from(this.stringToArrayBuffer(privKey)).toJSON()
			.data
		const randSalt = await RSAKeyHandler.getInstance().generateRandomSalt()
		// const message = new HelloConnectMessage(randSalt, arrayBuff)

    const message = new SystemMessageDisplayMessage(true, 13, [])

    console.log(message.MessageId)

		var writer: CustomDataWriter = new CustomDataWriter()

		message.Serialize(writer)
		await this.Pack(writer, message)
	}

	private stringToArrayBuffer(str: string) {
		const buffer = new ArrayBuffer(str.length)
		const view = new Uint8Array(buffer)
		for (let i = 0; i < str.length; i++) {
			view[i] = str.charCodeAt(i)
		}
		return buffer
	}

	public async Pack(writer: ICustomDataOutput, msg: Message): Promise<void> {
		return await new Promise<void>(async (resolve, reject) => {
			this.logger.write(
				"writer.Writer.buffer: " + writer.Writer.buffer.toString("hex")
			)
			var typeLen: number = this.ComputeTypeLen(writer.Writer.length)
			var staticHeader: number = this.SubComputeStaticHeader(
				msg.MessageId,
				typeLen
			)
			await this.logger.writeAsync(
				"staticHeader before writeShort: " + staticHeader
			)

			const headerData = Buffer.alloc(2)
			headerData.writeUInt16BE(staticHeader)

			const messageLength = Buffer.alloc(1)

			console.log("typeLen: " + typeLen)
			switch (typeLen) {
				case 0:
					break
				case 1:
					messageLength.writeUInt8(writer.Writer.buffer.length)
					break
				case 2:
					messageLength.writeUInt16BE(writer.Writer.buffer.length)
					break
				case 3:
					messageLength.writeUInt8((writer.Writer.length & 255) << 16)
					messageLength.writeUInt8((writer.Writer.length & 255) << 8)
					messageLength.writeUInt8(writer.Writer.length & 255)
					break
			}
			const newData = Buffer.concat([
				headerData,
				messageLength,
				writer.Writer.buffer,
			])

			await this.logger.writeAsync(
				`[SND] >> MessageId: ${msg.MessageId} | Data: ${newData.toString(
					"hex"
				)}`
			)
			// const isSent = socket.write(newData)

			// if (!isSent) {
			// 	await this.logger.writeAsync(
			// 		`[SND] >> MessageId: ${this.messageId} | Data: ${newData.toString(
			// 			"hex"
			// 		)}`,
			// 		ansiColorCodes.red
			// 	)
			// 	reject("Message not sent")
			// }

			resolve()
		})
	}

	ComputeTypeLen(len: number): number {
		if (len > 65535) {
			return 3
		}
		if (len > 255) {
			return 2
		}
		if (len > 0) {
			return 1
		}
		return 0
	}
	SubComputeStaticHeader(id: number, typeLen: number): number {
		return (id << 2) | typeLen
	}
}

ProtocolPlayground.getInstance().main()
