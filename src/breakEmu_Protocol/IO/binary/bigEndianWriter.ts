import { ExtendedBuffer, ExtendedBufferOptions } from "extended-buffer"

import BinaryWriter from "../interfaces/binaryWriter"

export default class BigEndianWriter extends ExtendedBuffer
	implements BinaryWriter {
	private static readonly CHUNCK_BIT_SIZE = 7

	private static readonly MASK_10000000 = 0x80
	private static readonly MASK_01111111 = 0x7f

	public constructor(options?: ExtendedBufferOptions) {
		super(options)
	}

	public writeVarInt(data: number): void {
		if (data <= BigEndianWriter.MASK_01111111) {
			this.writeByte(data)

			return
		}

		while (data !== 0) {
			let byte: number = data & BigEndianWriter.MASK_01111111

			data >>= BigEndianWriter.CHUNCK_BIT_SIZE

			if (data > 0) {
				byte |= BigEndianWriter.MASK_10000000
			}

			this.writeByte(byte)
		}
	}

	public writeVarUInt(data: number): void {
		this.writeVarInt(data)
	}

	public writeVarShort(data: number): void {
		if (data <= BigEndianWriter.MASK_01111111) {
			this.writeByte(data)

			return
		}

		while (data !== 0) {
			let byte: number = data & BigEndianWriter.MASK_01111111

			data >>= BigEndianWriter.CHUNCK_BIT_SIZE

			if (data > 0) {
				byte |= BigEndianWriter.MASK_10000000
			}

			this.writeByte(byte)
		}
	}

	public writeVarUShort(data: number): void {
		this.writeVarShort(data)
	}

	public writeVarLong(data: number): void {
		const value = BigInt(data)

		let low = value & 0xffffffffn
		let high = value >> 32n

		if (high === 0n) {
			this.writeVarInt(data)

			return
		}

		for (let i = 0; i < 4; i++) {
			this.writeByte(
				Number(
					(low & BigInt(BigEndianWriter.MASK_01111111)) |
						BigInt(BigEndianWriter.MASK_10000000)
				)
			)

			low >>= 7n
		}

		if ((high & 0xfffffff8n) === 0n) {
			this.writeByte(Number((high << 4n) | low))
		} else {
			this.writeByte(
				Number(
					(((high << 4n) | low) & BigInt(BigEndianWriter.MASK_01111111)) |
						BigInt(BigEndianWriter.MASK_10000000)
				)
			)

			high >>= 3n

			while (high >= 0x80n) {
				this.writeByte(
					Number(
						(high & BigInt(BigEndianWriter.MASK_01111111)) |
							BigInt(BigEndianWriter.MASK_10000000)
					)
				)

				high >>= 7n
			}

			this.writeByte(Number(high))
		}
	}

	public writeVarUhLong(data: number): void {
		this.writeVarLong(data)
	}

	public writeByte(data: number): void {
		super.writeUInt8(data)
	}

	public writeBytes(data: Int8Array): void {
		super.writeBuffer(Buffer.from(data.buffer))
	}

	public writeChar(data: string): void {
		this.writeByte(data.charCodeAt(0))
	}

	public writeBoolean(data: boolean): void {
		super.writeUInt8(data ? 1 : 0)
	}

	public writeShort(data: number): void {
		super.writeInt16BE(data)
	}

	public writeUShort(data: number): void {
		super.writeUInt16BE(data)
	}

	public writeInt(data: number): void {
		super.writeInt32BE(data)
	}

	public writeUInt(data: number): void {
		super.writeUInt32BE(data)
	}

	public writeLong(data: number): void {
		super.writeInt32BE(data)
	}

	public writeULong(data: number): void {
		super.writeUInt32BE(data)
	}

	public writeFloat(data: number): void {
		super.writeFloatBE(data)
	}

	public writeDouble(data: number): void {
		super.writeDoubleBE(data)
	}

	public writeUTF(data: string): void {
		this.writeUShort(Buffer.byteLength(data, "utf-8"))

		super.writeString(data, "utf-8")
	}

	public writeUTFBytes(data: string): void {
		super.writeString(data, "utf-8")
	}

	public getBuffer(): Buffer {
		return this.buffer
	}

	public getPointer(): number {
		return this._pointerEnd - this._pointerStart
	}

	public setPointer(pointer: number): this {
		this._pointerEnd = this._pointerStart + pointer

		return this
	}

	public getUint8Array(): Uint8Array {
		return new Uint8Array(this.buffer)
	}
}
