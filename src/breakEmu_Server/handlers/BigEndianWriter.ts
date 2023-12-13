import { Stream, Writable } from "stream"
import IDataWriter from "../IO/interface/IDataWriter"
// import { BinaryWriter, Encoding } from "csharp-binary-stream"
import ByteArray from "./ByteArray"
import { BinaryWriter } from "csharp-binary-stream"

// class BigEndianWriter implements IDataWriter {
// 	private writer: BinaryWriter
// 	public position: number

// 	constructor(buffer: Buffer) {
// 		this.writer = new BinaryWriter(buffer)
// 		this.position = 0
// 	}
// 	WriteSByte(value: number): void {
// 		throw new Error("Method not implemented.")
// 	}
// 	get Data(): number[] {
// 		return this.writer.toArray()
// 	}

// 	get Writer(): BinaryWriter {
// 		return this.writer
// 	}

// 	WriteSingle(value: number): void {
// 		throw new Error("Method not implemented.")
// 	}

// 	public WriteShort(short: number): void {
// 		this.writer.writeShort(short) // Utilisez writeUInt16 pour Big Endian
// 	}

// 	public WriteInt(int: number): void {
// 		this.writer.writeInt(int) // Utilisez writeUInt32 pour Big Endian
// 	}

// 	public WriteLong(long: number): void {
// 		this.writer.writeLong(long) // Utilisez writeBigInt64 pour Big Endian
// 	}

// 	public WriteUShort(ushort: number): void {
// 		this.writer.writeUnsignedShort(ushort)
// 	}

// 	public WriteUInt(uint: number): void {
// 		this.writer.writeUnsignedInt(uint)
// 	}

// 	public WriteULong(ulong: number): void {
// 		this.writer.writeUnsignedLong(ulong)
// 	}

// 	public WriteByte(byte: number): void {
// 		this.writer.writeByte(byte)
// 	}

// 	public WriteBoolean(bool: boolean): void {
// 		this.writer.writeBoolean(bool)
// 	}

// 	public WriteChar(char: string): void {
// 		this.writer.writeChar(char, Encoding.Utf8)
// 	}

// 	public WriteUTF(str: string): void {
// 		this.writer.writeString(str, Encoding.Utf8)
// 	}

// 	public WriteUTFBytes(str: string): void {
// 		this.writer.writeString(str, Encoding.Utf8)
// 	}

// 	public WriteFloat(float: number): void {
// 		this.writer.writeFloat(float)
// 	}

// 	public WriteDouble(double: number): void {
// 		this.writer.writeDouble(double)
// 	}

// 	public WriteBytes(data: number[]): void {
// 		this.writer.writeBytes(data) // Convertissez Buffer en Uint8Array
// 	}

// 	Clear(): void {
//     this.writer.clear()
// 	}
// 	Seek(offset: number): void {
// 		this.position = offset
// 	}
// }

class BigEndianWriter implements IDataWriter {
	private writer: ByteArray

	constructor(size?: number) {
		this.writer = new ByteArray()
	}
	get Data(): number[] {
		return this.writer.toArray()
	}
	get Writer(): ByteArray {
		return this.writer
	}
	WriteSByte(value: number): void {
		throw new Error("Method not implemented.")
	}

	WriteSingle(value: number): void {
		throw new Error("Method not implemented.")
	}

	public WriteShort(short: number): void {
		this.writer.writeShort(short)
	}

	public WriteInt(int: number): void {
		this.writer.writeInt(int)
	}

	public WriteLong(long: number): void {
		this.writer.writeLong(long)
	}

	public WriteUShort(ushort: number): void {
		this.writer.writeUnsignedShort(ushort)
	}

	public WriteUInt(uint: number): void {
		this.writer.writeUnsignedInt(uint)
	}

	public WriteULong(ulong: number): void {
		this.writer.writeUnsignedLong(ulong)
	}

	public WriteByte(byte: number): void {
    //check if buffer is full
    if (this.writer.length >= this.writer.buffer.length) {
      this.writer.expand(1)
    }
    this.writer.writeByte(byte)
	}

	public WriteBoolean(bool: boolean): void {
		this.writer.writeBoolean(bool ? 1 : 0)
	}

	public WriteChar(char: string): void {
		this.writer.writeShort(char.charCodeAt(0))
	}

	public async WriteUTF(str: string): Promise<void> {
		new Promise<void>((resolve, reject) => {
			this.writer.writeUTF(str)
			resolve()
		})
	}

	public WriteUTFBytes(str: string): void {
		this.writer.writeBytes(Buffer.from(str, "utf8"))
	}

	public WriteFloat(float: number): void {
		this.writer.writeFloat(float)
	}

	public WriteDouble(double: number): void {
		this.writer.writeDouble(double)
	}

	public WriteBytes(data: number[]): void {
		this.writer.writeBytes(data)
	}

	public dispose(): void {
		this.writer.clear()
	}

	Clear(): void {
		this.writer.clear()
	}
	Seek(offset: number): void {}
}

// class BigEndianWriter implements IDataWriter {
//   private buffer: Buffer;
//   public position: number;

//   constructor(size: number = 0) {
//     this.buffer = Buffer.alloc(size);
//     this.position = 0;
//   }

//   private ensureCapacity(additionalSize: number) {
//     if (this.position + additionalSize > this.buffer.length) {
//       let newBuffer = Buffer.alloc(this.buffer.length + additionalSize + 1024);
//       this.buffer.copy(newBuffer);
//       this.buffer = newBuffer;
//     }
//   }

//   get Data(): Buffer {
//     return this.buffer
//   }

//   get Writer(): BinaryWriter {
//     throw new Error("BinaryWriter not used in BigEndianWriter.");
//   }

//   WriteShort(value: number): void {
//     this.ensureCapacity(2);
//     this.buffer.writeInt16BE(value, this.position);
//     this.position += 2;
//   }

//   WriteInt(value: number): void {
//     this.ensureCapacity(4);
//     this.buffer.writeInt32BE(value, this.position);
//     this.position += 4;
//   }

//   WriteLong(value: number): void {
//     // Assuming value is within the safe integer range for JavaScript
//     this.ensureCapacity(8);
//     this.buffer.writeBigInt64BE(BigInt(value), this.position);
//     this.position += 8;
//   }

//   WriteUShort(value: number): void {
//     this.ensureCapacity(2);
//     this.buffer.writeUInt16BE(value, this.position);
//     this.position += 2;
//   }

//   WriteUInt(value: number): void {
//     this.ensureCapacity(4);
//     this.buffer.writeUInt32BE(value, this.position);
//     this.position += 4;
//   }

//   WriteULong(value: number): void {
//     this.ensureCapacity(8);
//     this.buffer.writeBigUInt64BE(BigInt(value), this.position);
//     this.position += 8;
//   }

//   WriteByte(value: number): void {
//     this.ensureCapacity(1);
//     this.buffer.writeUInt8(value, this.position);
//     this.position += 1;
//   }

//   WriteSByte(value: number): void {
//     this.ensureCapacity(1);
//     this.buffer.writeInt8(value, this.position);
//     this.position += 1;
//   }

//   WriteFloat(value: number): void {
//     this.ensureCapacity(4);
//     this.buffer.writeFloatBE(value, this.position);
//     this.position += 4;
//   }

//   WriteBoolean(value: boolean): void {
//     this.WriteByte(value ? 1 : 0);
//   }

//   WriteChar(value: string): void {
//     this.WriteShort(value.charCodeAt(0));
//   }

//   WriteDouble(value: number): void {
//     this.ensureCapacity(8);
//     this.buffer.writeDoubleBE(value, this.position);
//     this.position += 8;
//   }

//   WriteSingle(value: number): void {
//     this.WriteFloat(value);
//   }

//   WriteUTF(value: string): void {
//     const strBuffer = Buffer.from(value, "utf8");
//     this.WriteUShort(strBuffer.length);
//     this.WriteBytes(strBuffer);
//   }

//   WriteUTFBytes(value: string): void {
//     const strBuffer = Buffer.from(value, "utf8");
//     this.WriteBytes(strBuffer);
//   }

//   WriteBytes(value: Buffer): void {
//     this.ensureCapacity(value.length);
//     value.copy(this.buffer, this.position);
//     this.position += value.length;
//   }

//   Clear(): void {
//     this.position = 0;
//     this.buffer.fill(0);
//   }

//   Seek(offset: number): void {
//     if (offset < 0 || offset > this.buffer.length) {
//       throw new Error("Offset is outside the bounds of the buffer");
//     }
//     this.position = offset;
//   }
// }

export default BigEndianWriter
