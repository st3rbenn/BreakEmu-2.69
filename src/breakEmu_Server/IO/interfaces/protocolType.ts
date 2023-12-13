import { BinaryReader, BinaryWriter } from './index';

export default interface ProtocolType {
    serialize(writer: BinaryWriter): void;
    deserialize(reader: BinaryReader): void;
    hydrate(data: ProtocolType | Record<string, unknown>): ProtocolType;
}
