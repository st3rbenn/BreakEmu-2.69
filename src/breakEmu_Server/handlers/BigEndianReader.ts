import IDataReader from "../IO/interface/IDataReader"
import BinaryReader from "./BinaryReader"
class BigEndianReader implements IDataReader {
	private m_reader: BinaryReader

	constructor(data: Buffer) {
		this.m_reader = new BinaryReader(data)
	}
  
  private ReadBigEndianBytes(n: number): number[] {
    const bytes: number[] = []
    for (let i = 0; i < n; i++) {
      bytes.push(this.m_reader.readUInt8())
    }
    return bytes
  }

  private ToSingle(bytes: number[]): number {
    const sign = (bytes[3] >> 7) & 0x1
    const exponent = ((bytes[3] & 0x7f) << 1) | (bytes[2] >> 7)
    const mantissa = ((bytes[2] & 0x7f) << 16) | (bytes[1] << 8) | bytes[0]
    if (exponent === 0 && mantissa === 0) {
      return 0
    }
    if (exponent === 0xff && mantissa === 0) {
      return sign ? -Infinity : Infinity
    }
    if (exponent === 0xff && mantissa !== 0) {
      return NaN
    }
    return Math.pow(-1, sign) * Math.pow(2, exponent - 127) * (1 + mantissa / Math.pow(2, 23))
  }

  private ToUInt16(bytes: number[]): number {
    return bytes.reduce((acc, byte, i) => acc + byte * Math.pow(256, i), 0)
  }

  private ToUInt32(bytes: number[]): number {
    return bytes.reduce((acc, byte, i) => acc + byte * Math.pow(256, i), 0)
  }

  private ToUInt64(bytes: number[]): number {
    return bytes.reduce((acc, byte, i) => acc + byte * Math.pow(256, i), 0)
  }

	get Position(): number {
		return this.m_reader.offset
	}
	get BytesAvailable(): number {
		return this.m_reader.bytesAvailable()
	}
	ReadShort(): number {
    return this.ReadBigEndianBytes(2).reduce((acc, byte, i) => acc + byte * Math.pow(256, i), 0)
	}
	ReadInt(): number {
    return this.ReadBigEndianBytes(4).reduce((acc, byte, i) => acc + byte * Math.pow(256, i), 0)
	}
	ReadLong(): number {
    return this.ReadBigEndianBytes(8).reduce((acc, byte, i) => acc + byte * Math.pow(256, i), 0)
	}
	ReadFloat(): number {
		return this.ToSingle(this.ReadBigEndianBytes(4))
	}
	ReadUShort(): number {
		return this.ToUInt16(this.ReadBigEndianBytes(2))
	}
	ReadUInt(): number {
		return this.ToUInt32(this.ReadBigEndianBytes(4))
	}
	ReadULong(): number {
		return this.ToUInt64(this.ReadBigEndianBytes(8))
	}
	ReadByte(): number {
		return this.m_reader.readUInt8()
	}
	ReadSByte(): number {
		return this.m_reader.readInt8()
	}
	ReadBytes(n: number): number[] {
		return this.m_reader.readBytes(n).toJSON().data
	}
	ReadBoolean(): boolean {
		return this.m_reader.readUInt8() === 1
	}
	ReadChar(): string {
		return this.m_reader.readUShort().toString()
	}
	ReadDouble(): number {
		return this.m_reader.readDouble()
	}
	ReadUTF(): string {
		return this.m_reader.readStringUtf8()
	}
	ReadUTFBytes(len: number): string {
		return this.m_reader.readStringUtf8(len)
	}
}

export default BigEndianReader