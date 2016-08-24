import 'source-map-support/register';

import * as Blessed from 'blessed';
import { widget, Widgets } from 'blessed';
import { PingResult } from 'ping';

import { Ping } from './pinger';
import { Chart } from './chart';

process.title = 'ptop';

const Term: widget.Screen = Blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    dockBorders: true,
    ignoreDockContrast: true
});

// Quit on Escape, q, or Control-C.
Term.key(['escape', 'q', 'C-c', ':q'], function(ch, key) {
    return process.exit(0);
});

const latencyChartWindow: widget.Box = Blessed.box({
    label: ' Ping Latency ',
    top: 1,
    left: 'center',
    width: '100%',
    height: '50%',
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
Term.append(latencyChartWindow);

const latencyChartLabel: Widgets.TextElement = Blessed.text({
    top: 0,
    right: 0,
    width: 5,
    height: 1,
    content: '',
    tags: true,
    style: {
        fg: '#ccd2dd',
        bg: '#263238'
    }
});
latencyChartWindow.append(latencyChartLabel);

const pingStatsWindow: widget.Box = Blessed.box({
    label: ' Statistics ',
    bottom: 1,
    left: 'center',
    width: '100%',
    height: '50%-2',
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
    }
});
Term.append(pingStatsWindow);

const pingStatsLogWindow: widget.Box = Blessed.box({
    top: 0,
    left: 0,
    width: '50%',
    height: '100%-2',
    content: '',
    tags: true,
    scrollable: true,
    alwaysScroll: true,
    scrollbar: true,
    valign: 'bottom',
    mouse: true,
    border: {
        type: 'bg'
    },
    style: {
        fg: '#ccd2dd',
        bg: '#263238',
        border: {
            fg: '#f0f0f0'
        }
    }
});
pingStatsWindow.append(pingStatsLogWindow);

const pingStatsInfoWindow: widget.Box = Blessed.box({
    top: 0,
    right: 0,
    width: '50%',
    height: '100%-2',
    content: '',
    tags: true,
    align: 'center',
    valign: 'middle',
    border: {
        type: 'bg'
    },
    style: {
        fg: '#ccd2dd',
        bg: '#263238',
        border: {
            fg: '#f0f0f0'
        }
    }
});
pingStatsWindow.append(pingStatsInfoWindow);

const clockWindow: Widgets.TextElement = Blessed.text({
    top: 0,
    right: 1,
    width: 8,
    height: 1,
    content: '',
    tags: true,
    style: {
        fg: '#ccd2dd'
    }
});
Term.append(clockWindow);

const ptopHostText: Widgets.TextElement = Blessed.text({
    top: 0,
    left: 1,
    width: '100%-20',
    height: 1,
    content: '{red-fg}ptop{/} for DoA-MP.local',
    tags: true,
    style: {
        fg: '#ccd2dd'
    }
});
Term.append(ptopHostText);

const ptopStatusText: Widgets.TextElement = Blessed.text({
    bottom: 0,
    left: 1,
    width: '50%',
    height: 1,
    content: 'This is some status info on the bottom.',
    tags: true,
    style: {
        fg: '#ccd2dd'
    }
});
Term.append(ptopStatusText);

const ptopHintText: Widgets.TextElement = Blessed.text({
    bottom: 0,
    right: 1,
    width: '50%',
    height: 1,
    align: 'right',
    content: 'Maybe some commands you can do?',
    tags: true,
    style: {
        fg: '#ccd2dd'
    }
});
Term.append(ptopHintText);

Term.render();

function updateInfo () {
    pingStatsInfoWindow.setContent(`There have been {red-fg}${slowPackets + droppedPackets}{/} issues!`);
    pingStatsInfoWindow.insertBottom(`{red-fg}${(droppedPackets / totalPackets) * 100}%{/} have been dropped`);
    pingStatsInfoWindow.insertBottom(`{red-fg}${(slowPackets / totalPackets) * 100}%{/} have been exceedingly slow`);
}

const latencyChart = new Chart(latencyChartWindow);

function loop () {
    latencyChart.clear();

    latencyChartWindow.content = latencyChart.render();

    const date = new Date();
    let hours: string = date.getHours().toString();
    while (hours.length < 2) {
        hours = `0${hours}`;
    }
    let minutes: string = date.getMinutes().toString();
    while (minutes.length < 2) {
        minutes = `0${minutes}`;
    }
    let seconds: string = date.getSeconds().toString();
    while (seconds.length < 2) {
        seconds = `0${seconds}`;
    }
    let time: string = `${hours}:${minutes}:${seconds}`;
    clockWindow.content = time;

    updateInfo();

    Term.render();
}

let totalPackets = 0;
let slowPackets = 0;
let droppedPackets = 0;

function ping () {
    totalPackets++;
    Ping().then((res) => {
        latencyChartLabel.content = `{right}${Math.round(res.time)}ms{/right}`;
        latencyChart.data.splice(0, 0, res.time);
        if (res.time > 100) {
            slowPackets++;
            pingStatsLogWindow.insertBottom(`High ping! ${res.host}: ${res.time}`);
        }
    }).catch((err: PingResult) => {
        droppedPackets++;
        latencyChartLabel.content = `{right}∞ms{/right}`;
        pingStatsLogWindow.insertBottom(`Timeout! ${err.host}: ${err.time}`);
    });
}

setInterval(loop, 1000 / 30);
setInterval(ping, 1000);
