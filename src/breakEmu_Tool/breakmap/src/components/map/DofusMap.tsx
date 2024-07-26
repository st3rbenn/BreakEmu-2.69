"use client"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, useMap } from "react-leaflet"

const DofusMap = () => {
	const calculateTileUrl = (z: number, x: number, y: number): string => {
		// Logique de sélection de l'échelle basée sur z, et calcul du numéro d'image basé sur x et y
		let scale = "1" // Défaut à l'échelle 1 pour l'exemple
		let imagesPerRow = 10 // Ajuste selon l'échelle
		const imageNumber = y * imagesPerRow + x + 1
		return `/maps/incarnam/${scale}/${imageNumber}.png`
	}

	return (
		<MapContainer
			center={[51.505, -0.09]}
			zoom={13}
			style={{ height: "100vh", width: "100%" }}
		>
			<TileLayer
				attribution="Ton jeu Dofus"
        url=""
				tileSize={256} // Taille de tes tuiles (à ajuster selon ta configuration)
				zoomOffset={-1}
				minZoom={1}
				maxZoom={16}
				noWrap={true}
				bounds={[
					[51.49, -0.12],
					[51.52, -0.06],
				]} // Ajuste ces bornes selon les limites de ta carte
				tms={false}
			/>
		</MapContainer>
	)
}

export default DofusMap
