import { BinaryReader, BinaryWriter } from './index';

export default interface ProtocolMessage {
    serialize(writer: BinaryWriter): void;
    deserialize(reader: BinaryReader): void;
    hydrate(data: ProtocolMessage | Record<string, unknown>): ProtocolMessage;
}
