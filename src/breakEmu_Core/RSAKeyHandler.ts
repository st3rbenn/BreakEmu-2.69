import {
	createCipheriv,
	createPrivateKey,
	createPublicKey,
	generateKeyPairSync,
	KeyObject,
	privateDecrypt,
	privateEncrypt,
} from "crypto"
import { readFileSync } from "fs"
import Logger from "../breakEmu_Core/Logger"

class RSAKeyHandler {
	logger: Logger = new Logger("RSAKeyHandler")

	private static instance: RSAKeyHandler

	public encryptedPublicKey: Buffer = Buffer.alloc(0)
	public publicKey: Buffer = Buffer.alloc(0)
	public privateKey: string = ""

	public static getInstance(): RSAKeyHandler {
		if (!RSAKeyHandler.instance) {
			RSAKeyHandler.instance = new RSAKeyHandler()
		}

		return RSAKeyHandler.instance
	}

	generateKeyPair(): void {
		const { publicKey, privateKey } = generateKeyPairSync("rsa", {
			modulusLength: 1024,
			publicKeyEncoding: {
				type: "spki",
				format: "der",
			},
			privateKeyEncoding: {
				type: "pkcs1",
				format: "pem",
			},
		})

		const privKey = readFileSync(__dirname + "/private.pem", "utf-8")

		const encryptedPublicKey = privateEncrypt(
			createPrivateKey(privKey),
			publicKey
		)
		this.privateKey = privateKey
		this.publicKey = publicKey
		this.encryptedPublicKey = encryptedPublicKey
	}

	getAttribute(): { publicKey: string; privateKey: string; salt: string } {
		return {
			publicKey: createPublicKey({
				key: this.publicKey,
				format: "der",
				type: "spki",
			})
				.export({
					format: "pem",
					type: "spki",
				})
				.toString(),
			privateKey: this.privateKey,
			salt: [...Array(32)].map(() => Math.random().toString(36)[2]).join(""),
		}
	}
}

export default RSAKeyHandler
