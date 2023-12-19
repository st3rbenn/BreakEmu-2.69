import { DatabaseConfiguration } from "../breakEmu_API/DatabaseConfiguration"

export abstract class ServerConfiguration extends DatabaseConfiguration {
  public authServerHost: string = ""
  public authServerPort: number = 0
  public authServerTransitionUri: string = ""
  public worldServerHost: string = ""
  public worldServerPort: number = 0
  public showDebugMessages: boolean = false
  public showMessageProtocol: boolean = false
}