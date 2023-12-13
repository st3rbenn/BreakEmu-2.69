import { DatabaseConfiguration } from "./DatabaseConfiguration"

export abstract class ServerConfiguration extends DatabaseConfiguration {
  public authServerHost: string = ""
  public authServerPort: number = 0
  public showDebugMessages: boolean = false
  public showMessageProtocol: boolean = false
}