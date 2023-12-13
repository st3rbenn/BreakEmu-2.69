import ICustomDataInput from "breakEmu_Server/IO/interface/ICustomDataInput"
import ICustomDataOutput from "breakEmu_Server/IO/interface/ICustomDataOutput"
import Message from "breakEmu_Server/IO/message/Message"
import { Socket } from "net"

class IdentificationMessage extends Message {
	public MessageId: number = 4805

  public version: string;
  public lang: string = "";
  public credentials: number[];
  public serverId: number = 0;
  public autoconnect: boolean = false;
  public useCertificate: boolean = false;
  public useLoginToken: boolean = false;
  public sessionOptionalSalt: number = 0;
  public failedAttemps: number[]

  constructor() {
    super()
    this.version = "";
    this.credentials = [];
    this.failedAttemps = [];
  }







	public Unpack(reader: ICustomDataInput): void {
		throw new Error("Method not implemented.")
	}
	public Pack(writer: ICustomDataOutput, socket: Socket): Promise<void> {
		throw new Error("Method not implemented.")
	}
	public Serialize(writer: ICustomDataOutput): Promise<void> {
		throw new Error("Method not implemented.")
	}
	public Deserialize(reader: ICustomDataInput): void {
		throw new Error("Method not implemented.")
	}
}
