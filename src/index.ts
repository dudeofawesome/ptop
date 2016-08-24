import * as Blessed from 'blessed';
import { widget, Widgets } from 'blessed';
// import * as Canvas from 'drawille';
import { Canvas } from 'drawille';
const Drawille = require('drawille');
const Line = require('bresenham');

const Term: widget.Screen = Blessed.screen({
    smartCSR: true
});

const box: widget.Box = Blessed.box({
    label: ' Chart ',
    top: 'center',
    left: 'center',
    width: '100%-2',
    height: '100%-2',
    padding: {
        left: 1,
        right: 1
    },
    content: '',
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        fg: '#ccd2dd',
        bg: '#263238',
        border: {
            fg: '#f0f0f0'
        }
        // hover: {
        //     fg: '#888eaa',
        //     bg: '#fafafa'
        // }
    }
});

// Quit on Escape, q, or Control-C.
Term.key(['escape', 'q', 'C-c', ':q'], function(ch, key) {
    return process.exit(0);
});

Term.append(box);

Term.render();

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

const WIDTH: number = _width;
const HEIGHT: number = _height;

console.log(WIDTH, HEIGHT);

const canvas: Canvas = new Drawille(WIDTH, HEIGHT);

let a = 0;

function draw() {
    canvas.clear();

    for (let x = 0; x < WIDTH; x++) {
        canvas.set(x, Math.sin((x + a) / 10) * 10 + (HEIGHT / 2 - 5));
    }

    a++;
    if (a > WIDTH) {
        a = 0;
    }

    box.content = canvas.frame();
    Term.render();
}

setInterval(draw, 1000 / 24);
