import { BinaryReader, BinaryWriter, ProtocolType } from '../interfaces';

export default class DofusType implements ProtocolType {
    protected static id: number;
    public id: number;

    constructor() {
        this.id = ((this.constructor as unknown) as Record<string, unknown>).id as number;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public serialize(writer: BinaryWriter): void {
        throw 'Serializing empty type';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public deserialize(reader: BinaryReader): void {
        throw 'Deserializing empty type';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public hydrate(data: DofusType | Record<string, unknown>): DofusType {
        throw 'Hydrating empty message';
    }
}
