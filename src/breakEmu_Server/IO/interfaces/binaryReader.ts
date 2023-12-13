export default interface BinaryReader {
    readVarInt(): number;
    readVarUInt(): number;
    readVarShort(): number;
    readVarUShort(): number;
    readVarLong(): number;
    readVarUhLong(): number;
    readByte(): number;
    readChar(): string;
    readBoolean(): boolean;
    readShort(): number;
    readUShort(): number;
    readInt(): number;
    readUInt(byteLength?: number): number;
    readLong(): number;
    readULong(): number;
    readFloat(): number;
    readDouble(): number;
    readUTF(): string;
    readUTFBytes(size: number): string;

    getPointer(): number;
    setPointer(pointer: number): this;

    getReadableSize(): number;
}
