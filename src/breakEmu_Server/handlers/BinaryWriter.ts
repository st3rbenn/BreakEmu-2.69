class BinaryWriter {
	private _buffer: Buffer
	private _length: number

	constructor(size?: number) {
		if (!size || size <= 0) {
			size = Buffer.poolSize / 2
		}
		this._buffer = Buffer.alloc(size)
		this._length = 0
	}

	writeUnsignedByte(value: number): void {
		this.checkAlloc(1)
		this._buffer.writeUInt8(value, this._length)
	}

	writeByte(value: number): void {
		this.checkAlloc(1)
		this._buffer.writeInt8(value, this._length)
	}

	writeUInt16(value: number): void {
		this.checkAlloc(2)
		this._buffer.writeUInt16BE(value, this._length)
	}

	writeInt16(value: number): void {
		this.checkAlloc(2)
		this._buffer.writeInt16BE(value, this._length)
	}

	WriteUnsignedInt(value: number): void {
		this.checkAlloc(4)
		this._buffer.writeUInt32BE(value, this._length)
	}

	WriteSByte(value: number): void {
		this.checkAlloc(1) // Assurez-vous qu'il y a suffisamment d'espace dans le buffer
		this._buffer.writeInt8(value, this._length)
	}

	WriteLong(value: number): void {
		this.checkAlloc(8)
		this._buffer.writeBigInt64BE(BigInt(value), this._length)
	}

	WriteInt(value: number): void {
		this.checkAlloc(4)
		this._buffer.writeInt32BE(value, this._length)
	}

	writeFloat(value: number): void {
		this.checkAlloc(4)
		this._buffer.writeFloatBE(value, this._length)
		this._length += 4
	}

	writeDouble(value: number): void {
		this.checkAlloc(8)
		this._buffer.writeDoubleBE(value, this._length)
		this._length += 8
	}

	writeBytes(data: Buffer): void {
		this.checkAlloc(data.length)
		data.copy(this._buffer, this._length, 0, data.length)
		this._length += data.length
	}

	writeStringUtf8(value: string): void {
		this.checkAlloc(length)
		this._buffer.write(value, this._length, length, "utf8")
		this._length += length
	}

	writeStringUnicode(value: string): void {
		const length = Buffer.byteLength(value, "ucs2")
		this.checkAlloc(length)
		this._buffer.write(value, this._length, length, "ucs2")
		this._length += length
	}

	writeStringZeroUtf8(value: string): void {
		this.writeStringUtf8(value)
		this.writeUnsignedByte(0)
	}

	writeStringZeroUnicode(value: string): void {
		this.writeStringUnicode(value)
		this.writeUInt16(0)
	}

	getLength(): number {
		return this._length
	}

	reset(): void {
		this._length = 0
	}

	toBuffer(): Buffer {
		return Buffer.concat([this._buffer.slice(0, this._length)])
	}

	private checkAlloc(size: number): void {
		const needed = this._length + size
		if (this._buffer.length >= needed) return

		const chunk = Math.max(Buffer.poolSize / 2, 1024)
		const chunkCount = Math.ceil(needed / chunk)
		const buffer = Buffer.alloc(chunkCount * chunk)
		this._buffer.copy(buffer, 0, 0, this._length)
		this._buffer = buffer
	}
}

export default BinaryWriter
