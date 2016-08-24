import { widget, Widgets } from 'blessed';
// import * as Canvas from 'drawille';
const Drawille = require('drawille');
import { Canvas } from 'drawille';

export class Chart {
    private width: number;
    private height: number;

    private canvas: Canvas;

    public data: number[] = [];

    public options: ChartOptions = {
        bar: {
            width: 2,
            spacing: 0
        }
    };

    constructor (box: widget.Box);
    constructor (width: number, height: number);
    constructor (width: number | widget.Box, height?: number) {
        if (typeof width === 'number') {
            this.width = width;
            this.height = height;
        } else {
            let box = width;

            let _width: number = (box.width as number) * 2 - 4;
            if ((box.options.padding as Widgets.Padding).left) {
                _width -= (box.options.padding as Widgets.Padding).left * 2;
            }
            if ((box.options.padding as Widgets.Padding).right) {
                _width -= (box.options.padding as Widgets.Padding).right * 2;
            }
            let _height: number = (box.height as number) * 4 - 8;
            if ((box.options.padding as Widgets.Padding).top) {
                _height -= (box.options.padding as Widgets.Padding).top * 4;
            }
            if ((box.options.padding as Widgets.Padding).bottom) {
                _height -= (box.options.padding as Widgets.Padding).bottom * 4;
            }

            this.width = _width;
            this.height = _height;
        }

        console.log(this.width, this.height);

        this.canvas = new Drawille(this.width, this.height);
    }

    public clear () {
        this.canvas.clear();
    }

    public set (x: number, y: number) {
        this.canvas.set(x, y);
    }

    public render (clear: boolean = true): string {
        if (clear) {
            this.canvas.clear();
        }

        for (let i = 0; i < this.data.length; i++) {
            for (let j = 0; j < this.options.bar.width; j++) {
                for (let k = 0; k < this.data[i]; k++) {
                    let x = (i + this.options.bar.spacing) * 2 + j;

                    this.canvas.set(this.width - x, this.height - k);
                }
            }
        }

        this.pruneData();

        return this.canvas.frame();
    }

    public pruneData () {
        if (this.width < this.data.length) {
            this.data.splice(this.width, this.data.length - this.width);
        }
    }

    public getWidth (): number {
        return this.width;
    }

    public getHeight (): number {
        return this.height;
    }
}

export interface ChartOptions {
    bar: {
        width: number;
        spacing: number;
    };
}
