import { BinaryBigEndianReader, BinaryBigEndianWriter } from '../binary';
import { NetworkMessageHeader } from '../types';

export default class DofusNetworkMessage {
    static readonly BIT_RIGHT_SHIFT_LEN_PACKET_ID = 2;
    static readonly BIT_MASK = 3;

    public static readHeader(reader: BinaryBigEndianReader): NetworkMessageHeader {
        const header: number = reader.readUShort();

        const messageId: number = header >> DofusNetworkMessage.BIT_RIGHT_SHIFT_LEN_PACKET_ID;
        const typeLength: number = header & DofusNetworkMessage.BIT_MASK;

        const instanceId: number = reader.readInt();

        if (typeLength < 0 || typeLength >= 3) {
            throw `Invalid type length: '${typeLength}'`;
        }

        let payloadSize: number = typeLength;

        if (typeLength > 0) {
            payloadSize = reader.readUInt(typeLength);
        }

        return {
            messageId,
            instanceId,
            payloadSize,
        } as NetworkMessageHeader;
    }

    public static writeHeader(writer: BinaryBigEndianWriter, messageId: number, messageWriter: BinaryBigEndianWriter): void {
        const type: number = DofusNetworkMessage.computeTypeLength(messageWriter.getPointer());

        writer.writeUShort((messageId << DofusNetworkMessage.BIT_RIGHT_SHIFT_LEN_PACKET_ID) | type);

        let typeWritingMethod: (data: number) => void;

        if (type === 1) {
            typeWritingMethod = writer.writeByte;
        } else if (type === 2) {
            typeWritingMethod = writer.writeShort;
        } else {
            throw `Message payload too big: ${messageWriter.getPointer()}b`;
        }

        typeWritingMethod.bind(writer)(messageWriter.getPointer());
    }

    public static computeTypeLength(length: number): number {
        if (length > 65535) {
            return 3;
        } else if (length > 255) {
            return 2;
        } else {
            return 1;
        }
    }
}
