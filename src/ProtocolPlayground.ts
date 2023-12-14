import SystemMessageDisplayMessage from './breakEmu_Protocol/messages/system/SystemMessageDisplayMessage';
import RSAKeyHandler from "./breakEmu_Core/RSAKeyHandler"
import Logger from "./breakEmu_Core/Logger"
import { genSaltSync, hashSync, compareSync } from "bcrypt"

class ProtocolPlayground {
	public logger: Logger = new Logger("ProtocolPlayground")

	messageId: number = 7439

	private static _instance: ProtocolPlayground

	public static getInstance(): ProtocolPlayground {
		if (!ProtocolPlayground._instance) {
			ProtocolPlayground._instance = new ProtocolPlayground()
		}

		return ProtocolPlayground._instance
	}

	public async main(): Promise<void> {
    const salt = genSaltSync(10)
    const hash = hashSync("test", salt)
    this.logger.write(hash)
		
	}
}

ProtocolPlayground.getInstance().main()
