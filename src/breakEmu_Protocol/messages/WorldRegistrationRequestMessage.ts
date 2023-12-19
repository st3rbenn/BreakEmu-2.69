import { DofusMessage } from "../../breakEmu_Server/IO"
import { BinaryReader, BinaryWriter } from "../../breakEmu_Server/IO/interfaces"

export class WorldRegistrationRequestMessage extends DofusMessage {
	public static id: number = 2590

	public serverId: number
	public address: string
	public port: number
	public name: string
	public capacity: number
	public requiredRole: number
	public isMonoAccount: boolean
	public isSelectable: boolean
	public requireSubscription: boolean

	constructor(
		id: number,
		address: string,
		port: number,
		name: string,
		capacity: number,
		requiredRole: number,
		isMonoAccount: boolean,
		isSelectable: boolean,
		requireSubscription: boolean
	) {
		super()
		this.serverId = id
		this.address = address
		this.port = port
		this.name = name
		this.capacity = capacity
		this.requiredRole = requiredRole
		this.isMonoAccount = isMonoAccount
		this.isSelectable = isSelectable
		this.requireSubscription = requireSubscription
	}

	public serialize(writer: BinaryWriter): void {
    writer.writeVarInt(this.serverId)
    writer.writeUTF(this.address)
    writer.writeShort(this.port)
    writer.writeUTF(this.name)
    writer.writeByte(this.capacity)
    writer.writeByte(this.requiredRole)
    writer.writeBoolean(this.isMonoAccount)
    writer.writeBoolean(this.isSelectable)
    writer.writeBoolean(this.requireSubscription)
	}

	public deserialize(reader: BinaryReader): void {
    this.serverId = reader.readVarInt()
    this.address = reader.readUTF()
    this.port = reader.readShort()
    this.name = reader.readUTF()
    this.capacity = reader.readByte()
    this.requiredRole = reader.readByte()
    this.isMonoAccount = reader.readBoolean()
    this.isSelectable = reader.readBoolean()
    this.requireSubscription = reader.readBoolean()
	}
}
