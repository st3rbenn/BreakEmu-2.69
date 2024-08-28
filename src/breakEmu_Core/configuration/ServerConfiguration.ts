import { DatabaseConfiguration } from "./DatabaseConfiguration"

export abstract class ServerConfiguration extends DatabaseConfiguration {
  public authServerHost: string = ""
  public authServerPort: number = 0
  public worldServerHost: string = ""
  public worldServerPort: number = 0
  public snifferServerHost: string = ""
  public snifferServerPort: number = 0
}