import * as blessed from 'blessed';
import { Writable } from 'stream';

class BlessedStream extends Writable {
    private logBox: blessed.Widgets.BoxElement;

    constructor(logBox: blessed.Widgets.BoxElement) {
        super();
        this.logBox = logBox;
    }

    _write(chunk: any, encoding: string, callback: Function) {
        const message = chunk.toString();
        this.logBox.insertBottom(message);
        this.logBox.scroll(1);
        callback();
    }
}

export default BlessedStream;