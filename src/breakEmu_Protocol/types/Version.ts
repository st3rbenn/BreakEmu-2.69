import ICustomDataInput from "breakEmu_Server/IO/interface/ICustomDataInput"
import ICustomDataOutput from "breakEmu_Server/IO/interface/ICustomDataOutput"

class Version {
	public protocolId: number = 8028

	public major: number = 0
	public minor: number = 0
	public code: number = 0
	public build: number = 0
	public buildType: number = 0

	constructor(
		major: number,
		minor: number,
		code: number,
		build: number,
		buildType: number
	) {
		this.major = major
		this.minor = minor
		this.code = code
		this.build = build
		this.buildType = buildType
	}

	public Serialize(output: ICustomDataOutput): void {
		output.WriteByte(this.major)
		output.WriteByte(this.minor)
		output.WriteByte(this.code)
		output.WriteInt(this.build)
		output.WriteByte(this.buildType)
	}

	public Deserialize(input: ICustomDataInput): void {}
}
