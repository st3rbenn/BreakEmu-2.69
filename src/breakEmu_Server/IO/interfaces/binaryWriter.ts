export default interface BinaryWriter {
    writeVarInt(data: number): void;
    writeVarUInt(data: number): void;
    writeVarShort(data: number): void;
    writeVarUShort(data: number): void;
    writeVarLong(data: number): void;
    writeVarUhLong(data: number): void;
    writeByte(data: number): void;
    writeBytes(data: Int8Array): void;
    writeBuffer(data: Buffer): void;
    writeChar(data: string): void;
    writeBoolean(data: boolean): void;
    writeShort(data: number): void;
    writeUShort(data: number): void;
    writeInt(data: number): void;
    writeUInt(data: number): void;
    writeLong(data: number): void;
    writeULong(data: number): void;
    writeFloat(data: number): void;
    writeDouble(data: number): void;
    writeUTF(data: string): void;
    writeUTFBytes(data: string): void;

    getBuffer(): Buffer;

    getPointer(): number;
    setPointer(pointer: number): this;
}
