import { BinaryReader, BinaryWriter, ProtocolMessage } from '../interfaces';

export default class DofusMessage implements ProtocolMessage {
    protected static id: number;
    public id: number;

    constructor() {
        this.id = ((this.constructor as unknown) as Record<string, unknown>).id as number;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public serialize(writer: BinaryWriter): void {
        throw 'Serializing empty message';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public deserialize(reader: BinaryReader): void {
        throw 'Deserializing empty message';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public hydrate(data: DofusMessage | Record<string, unknown>): DofusMessage {
        throw 'Hydrating empty message';
    }
}
