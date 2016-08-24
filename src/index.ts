const Blessed = require('blessed');
const Canvas = require('drawille');
const Line = require('bresenham');


const screen = Blessed.screen({
    smartCSR: true
});

const box = Blessed.box({
    label: ' Clock ',
    top: 'center',
    left: 'center',
    width: '100%-4',
    height: '100%-4',
    padding: 5,
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
        },
        hover: {
            fg: '#888eaa',
            bg: '#fafafa'
        }
    }
});

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c', ':q'], function(ch, key) {
    return process.exit(0);
});

screen.append(box);

screen.render();

var c = new Canvas(160, 160);

function draw() {
    c.clear();
    var t = new Date();
    var sin = function(i, l) {
        return Math.floor(Math.sin(i*2*Math.PI)*l+80);
    }, cos = function(i, l) {
        return Math.floor(Math.cos(i*2*Math.PI)*l+80);
    };
    Line(80, 80, sin(t.getHours()/24, 30), 160-cos(t.getHours()/24, 30), c.set.bind(c));
    Line(80, 80, sin(t.getMinutes()/60, 50), 160-cos(t.getMinutes()/60, 50), c.set.bind(c));
    Line(80, 80, sin(t.getSeconds()/60+(+t%1000)/60000, 75), 160-cos(t.getSeconds()/60+(+t%1000)/60000, 75), c.set.bind(c));
    //   process.stdout.write(c.frame());
    box.content = c.frame();
    screen.render();
}

setInterval(draw, 1000/24);
