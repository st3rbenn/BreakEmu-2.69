import * as blessed from "blessed"

class AuthServerStatus {
	private screen: blessed.Widgets.Screen
	private header: blessed.Widgets.BoxElement
	private logBox: blessed.Widgets.BoxElement

	private static _instance: AuthServerStatus

	constructor() {
		this.screen = blessed.screen({
			smartCSR: true,
		})

		this.header = blessed.box({
			top: 0,
			left: 0,
			width: "100%",
			height: "10%",
			content: "Nombre de joueurs connectés: 0",
			style: {
				fg: "white",
				bg: "gray",
				border: {
					fg: "#f0f0f0",
				},
			},
		})

		this.logBox = blessed.box({
			top: "10%",
			left: 0,
			width: "100%",
			height: "90%",
			content: "",
			scrollable: true,
			alwaysScroll: true,
			scrollbar: {
				ch: " ",
			},
			style: {
				fg: "white",
				bg: "black",
				border: {
					fg: "#f0f0f0",
				},
			},
		})

		this.screen.append(this.header)
		this.screen.append(this.logBox)

		// Capturez et affichez les logs ici
		// Exemple: this.log('Nouveau log: ...');
	}

	public static get Instance(): AuthServerStatus {
		if (!AuthServerStatus._instance) {
			AuthServerStatus._instance = new AuthServerStatus()
		}

		return AuthServerStatus._instance
	}

  public get Screen(): blessed.Widgets.Screen {
    return AuthServerStatus.Instance.screen;
  }

  public get LogBox(): blessed.Widgets.BoxElement {
    return AuthServerStatus.Instance.logBox;
  }

	initializeHeader(): void {
		setInterval(() => {
			const playerCount = this.getPlayerCount()
			this.updateHeader(playerCount)
		}, 5000)

		this.screen.render()
	}

	private updateHeader(playerCount: number): void {
		this.header.setContent(`Nombre de joueurs connectés: ${playerCount}`)
		this.screen.render()
	}

	private getPlayerCount(): number {
		return Math.floor(Math.random() * 100)
	}

	public log(message: string): void {
		this.logBox.insertBottom(message)
		this.logBox.scroll(1)
		this.screen.render()
	}
}

export default AuthServerStatus
