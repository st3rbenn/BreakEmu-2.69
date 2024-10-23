import GameMap, { CellData } from "@breakEmu_API/model/map.model"

class Cell {
	id: number
	blue: boolean
	red: boolean
	losMov: number
	mapChangeData: number

	constructor(
		id: number,
		blue: boolean,
		red: boolean,
		losMov: number,
		mapChangeData: number
	) {
		this.id = id
		this.blue = blue
		this.red = red
		this.losMov = losMov
		this.mapChangeData = mapChangeData
	}

	public isWalkable(): boolean {
		return (this.losMov & 1) == 0
	}

  public getNearCells(
    gameMap: GameMap
  ): Cell[] {
    const nearCells: Cell[] = []
    const nearCellsId = [
      this.id - 14,
      this.id - 1,
      this.id + 1,
      this.id + 14,
    ]
    for (const cellId of nearCellsId) {
      const cell = gameMap.cells.get(cellId)
      if (cell) {
        nearCells.push(cell)
      }
    }
    return nearCells
  }

  public getCenterCell(
    gameMap: GameMap
  ): Cell {
    return gameMap.cells.get(this.id + 1) as Cell
  }

	public save(): CellData {
		return {
			id: this.id,
			blue: this.blue,
			red: this.red,
			losMov: this.losMov,
			mapChangeData: this.mapChangeData,
		}
	}
}

export default Cell
