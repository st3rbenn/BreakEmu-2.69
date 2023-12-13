import { Buffer } from 'buffer';

class BinaryReader {
    private _offset: number;
    private _buffer: Buffer;

    constructor(buffer: Buffer) {
        this._offset = 0;
        this._buffer = Buffer.from(buffer);
    }

    get offset(): number {
        return this._offset;
    }

    readUInt8(): number {
        const value = this._buffer.readUInt8(this._offset);
        this._offset += 1;
        return value;
    }

    readInt8(): number {
        const value = this._buffer.readInt8(this._offset);
        this._offset += 1;
        return value;
    }

    readUInt16(): number {
        const value = this._buffer.readUInt16LE(this._offset);
        this._offset += 2;
        return value;
    }

    readInt16(): number {
        const value = this._buffer.readInt16LE(this._offset);
        this._offset += 2;
        return value;
    }

    readUInt32(): number {
        const value = this._buffer.readUInt32LE(this._offset);
        this._offset += 4;
        return value;
    }

    readInt32(): number {
        const value = this._buffer.readInt32LE(this._offset);
        this._offset += 4;
        return value;
    }

    readFloat(): number {
        const value = this._buffer.readFloatLE(this._offset);
        this._offset += 4;
        return value;
    }

    readDouble(): number {
        const value = this._buffer.readDoubleLE(this._offset);
        this._offset += 8;
        return value;
    }

    readBytes(length: number): Buffer {
        const value = this._buffer.slice(this._offset, this._offset + length);
        this._offset += length;
        return value;
    }

    skipBytes(length: number): void {
        this._offset += length;
    }

    readStringUtf8(length?: number): string {
        if (length == null) length = this._buffer.length - this._offset;
        length = Math.max(0, length);
        const value = this._buffer.toString('utf8', this._offset, this._offset + length);
        this._offset += length;
        return value;
    }

    readStringUnicode(length?: number): string {
        if (length == null) length = this._buffer.length - this._offset;
        length = Math.max(0, length);
        const safeLength = length - (length % 2);
        const value = this._buffer.toString('ucs2', this._offset, this._offset + safeLength);
        this._offset += length;
        return value;
    }

    readStringZeroUtf8(): string {
        let length = 0;
        let terminatorLength = 0;
        for (let i = this._offset; i < this._buffer.length; i++) {
            if (this._buffer.readUInt8(i) === 0) {
                terminatorLength = 1;
                break;
            }
            length++;
        }
        const value = this.readStringUtf8(length);
        this._offset += terminatorLength;
        return value;
    }

    readStringZeroUnicode(): string {
        let length = 0;
        let terminatorLength = ((this._buffer.length - this._offset) & 1) !== 0 ? 1 : 0;
        for (let i = this._offset; i + 1 < this._buffer.length; i += 2) {
            if (this._buffer.readUInt16LE(i) === 0) {
                terminatorLength = 2;
                break;
            }
            length += 2;
        }
        const value = this.readStringUnicode(length);
        this._offset += terminatorLength;
        return value;
    }

    bytesAvailable(): number {
        return this._buffer.length - this._offset;
    }

    readUShort(): number {
        return this.readUInt16();
    }
}

export default BinaryReader;
