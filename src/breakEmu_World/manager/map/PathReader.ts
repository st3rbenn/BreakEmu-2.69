import Logger from "../../../breakEmu_Core/Logger";

class PathReader {
    private static logger: Logger = new Logger("PathReader")

    public static readCell(cell: number) {
        return cell & 4095
    }
    public static readDirection(result: number) {
        return result >> 12
    }
}

export default PathReader