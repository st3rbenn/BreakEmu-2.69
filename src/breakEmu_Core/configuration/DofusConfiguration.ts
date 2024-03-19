import { ServerConfiguration } from "./ServerConfiguration";

class DofusConfiguration extends ServerConfiguration {
	public dofusProtocolVersion: string = ""
	public versionMajor: number = 0
	public versionMinor: number = 0
  public apLimit: number = 0
  public startAp: number = 0
  public mpLimit: number = 0
  public startMp: number = 0
  public startLevel: number = 0
  public startMapId: number = 0
  public startCellId: number = 0
  public startKamas: number = 0
  public startStatsPoints: number = 0
  public XpRate: number = 0
  public jobXpRate: number = 0
  public dropRate: number = 0
}

export default DofusConfiguration