import { ExtendedBuffer, ExtendedBufferOptions } from "extended-buffer"
//@ts-ignore
import BigNumber from "big-number/big-number"
import BinaryReader from "../interfaces/binaryReader"

export default class BigEndianReader extends ExtendedBuffer
	implements BinaryReader {
	static readonly INT_SIZE = 32
	static readonly SHORT_SIZE = 16
	static readonly SHORT_MAX_VALUE = 0x7fff
	static readonly USHORT_MAX_VALUE = 0x10000

	static readonly CHUNCK_BIT_SIZE = 7

	static readonly MASK_10000000 = 128
	static readonly MASK_01111111 = 127

	public constructor(options?: ExtendedBufferOptions) {
		super(options)
	}

	readVarInt(): number {
		let value: number = 0
		let size: number = 0

		while (size < BigEndianReader.INT_SIZE) {
			const byte: number = this.readByte()
			const bit: boolean =
				(byte & BigEndianReader.MASK_10000000) == BigEndianReader.MASK_10000000

			if (size > 0) {
				value |= (byte & BigEndianReader.MASK_01111111) << size
			} else {
				value |= byte & BigEndianReader.MASK_01111111
			}

			size += BigEndianReader.CHUNCK_BIT_SIZE

			if (!bit) {
				return value
			}
		}

		throw "Overflow varint : too much data"
	}

	readVarUInt(): number {
		return this.readVarInt() >>> 0
	}

	readVarShort(): number {
		let value: number = 0
		let offset: number = 0

		while (offset < BigEndianReader.SHORT_SIZE) {
			const byte: number = this.readByte()
			const bit: boolean =
				(byte & BigEndianReader.MASK_10000000) == BigEndianReader.MASK_10000000

			if (offset > 0) {
				value |= (byte & BigEndianReader.MASK_01111111) << offset
			} else {
				value |= byte & BigEndianReader.MASK_01111111
			}

			offset += BigEndianReader.CHUNCK_BIT_SIZE

			if (!bit) {
				if (value > BigEndianReader.SHORT_MAX_VALUE) {
					value -= BigEndianReader.USHORT_MAX_VALUE
				}

				return value
			}
		}

		throw "Overflow var short : too much data"
	}

	readVarUShort(): number {
		return this.readVarShort() >>> 0
	}

	readVarLong(): number {
		let low = 0n
		let high = 0n
		let size: number = 0
		let lastByte: number = 0

		while (size < 28) {
			lastByte = this.readByte()

			if (
				(lastByte & BigEndianReader.MASK_10000000) ==
				BigEndianReader.MASK_10000000
			) {
				low |= (BigInt(lastByte) & 127n) << BigInt(size)
				size += 7
			} else {
				low |= BigInt(lastByte) << BigInt(size)
				return this.handleNegative(low)
			}
		}

		lastByte = this.readByte()

		if (
			(lastByte & BigEndianReader.MASK_10000000) ==
			BigEndianReader.MASK_10000000
		) {
			low |=
				(BigInt(lastByte) & BigInt(BigEndianReader.MASK_01111111)) <<
				BigInt(size)
			high = (BigInt(lastByte) & BigInt(BigEndianReader.MASK_01111111)) >> 4n

			size = 3

			while (size < 32) {
				lastByte = this.readByte()

				if (
					(lastByte & BigEndianReader.MASK_10000000) ===
					BigEndianReader.MASK_10000000
				) {
					high |=
						(BigInt(lastByte) & BigInt(BigEndianReader.MASK_01111111)) <<
						BigInt(size)
				} else {
					break
				}

				size += 7
			}

			high |= BigInt(lastByte) << BigInt(size)

			return this.handleNegative((low & 0xffffffffn) | (high << 32n))
		}

		low |= BigInt(lastByte) << BigInt(size)
		high = BigInt(lastByte) >> 4n

		return this.handleNegative((low & 0xffffffffn) | (high << 32n))
	}

	private handleNegative(value: bigint): number {
		const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER)
		const MIN_SAFE_INTEGER = BigInt(Number.MIN_SAFE_INTEGER)

		if (value > MAX_SAFE_INTEGER || value < MIN_SAFE_INTEGER) {
			console.warn(
				"Warning: Number exceeds safe integer range. Precision may be lost."
			)
		}

		if (value > (1n << 63n) - 1n) {
			// C'est un nombre négatif en complément à deux
			value = value - (1n << 64n)
		}

		return Number(value)
	}

	// readVarLong(): number {
	// 	let low = 0n
	// 	let high = 0n

	// 	let size: number = 0

	// 	let lastByte: number = 0

	// 	while (size < 28) {
	// 		lastByte = this.readByte()

	// 		if (
	// 			(lastByte & BigEndianReader.MASK_10000000) ==
	// 			BigEndianReader.MASK_10000000
	// 		) {
	// 			low |= (BigInt(lastByte) & 127n) << BigInt(size)

	// 			size += 7
	// 		} else {
	// 			low |= BigInt(lastByte) << BigInt(size)

	// 			return Number(low)
	// 		}
	// 	}

	// 	lastByte = this.readByte()

	// 	if (
	// 		(lastByte & BigEndianReader.MASK_10000000) ==
	// 		BigEndianReader.MASK_10000000
	// 	) {
	// 		low |=
	// 			(BigInt(lastByte) & BigInt(BigEndianReader.MASK_01111111)) <<
	// 			BigInt(size)
	// 		high = (BigInt(lastByte) & BigInt(BigEndianReader.MASK_01111111)) >> 4n

	// 		size = 3

	// 		while (size < 32) {
	// 			lastByte = this.readByte()

	// 			if (
	// 				(lastByte & BigEndianReader.MASK_10000000) ===
	// 				BigEndianReader.MASK_10000000
	// 			) {
	// 				high |=
	// 					(BigInt(lastByte) & BigInt(BigEndianReader.MASK_01111111)) <<
	// 					BigInt(size)
	// 			} else {
	// 				break
	// 			}

	// 			size += 7
	// 		}

	// 		high |= BigInt(lastByte) << BigInt(size)

	// 		return Number((low & 0xffffffffn) | (high << 32n))
	// 	}

	// 	low |= BigInt(lastByte) << BigInt(size)
	// 	high = BigInt(lastByte) >> 4n

	// 	return Number((low & 0xffffffffn) | (high << 32n))
	// }

	readVarUhLong(): number {
		return this.readVarLong()
	}

	readByte(): number {
		return super.readUInt8()
	}

	readChar(): string {
		return String.fromCharCode(this.readByte())
	}

	readBoolean(): boolean {
		return super.readUInt8() === 1
	}

	readShort(): number {
		return super.readInt16BE()
	}

	readUShort(): number {
		return super.readUInt16BE()
	}

	readInt(): number {
		return super.readInt32BE()
	}

	readUInt(byteLength?: number): number {
		return byteLength ? super.readUIntBE(byteLength) : super.readUInt32BE()
	}

	readLong(): number {
		return super.readInt32BE()
	}

	readULong(): number {
		return super.readUInt32BE()
	}

	readFloat(): number {
		return super.readFloatBE()
	}

	readDouble(): number {
		return super.readDoubleBE()
	}

	readUTF(): string {
		const length = this.readShort()

		return super.readString(length, "utf-8")
	}

	readUTFBytes(size: number): string {
		return super.readString(size, "utf-8")
	}

	getPointer(): number {
		return this._pointer
	}

	setPointer(pointer: number): this {
		return super.setPointer(pointer)
	}
}
