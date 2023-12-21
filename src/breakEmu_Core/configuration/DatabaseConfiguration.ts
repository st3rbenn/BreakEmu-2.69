import { DebugConfiguration } from "./DebugConfiguration"

export abstract class DatabaseConfiguration extends DebugConfiguration {
  public databaseHost: string = ""
  public databasePort: number = 0
  public databaseUser: string = ""
  public databasePassword: string = ""
  public databaseName: string = ""
}