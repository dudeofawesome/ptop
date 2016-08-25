#! /usr/bin/env node

import 'source-map-support/register';

import { hostname } from 'os';
import * as Blessed from 'blessed';
import { widget, Widgets } from 'blessed';
import { PingResult } from 'ping';

import { Ping } from './pinger';
import { Chart } from './chart';
import { Colors } from './colors';

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
        fg: Colors.text,
        bg: Colors.background,
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
        fg: Colors.text,
        bg: Colors.background
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
        fg: Colors.text,
        bg: Colors.background,
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
        fg: Colors.text,
        bg: Colors.background,
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
        fg: Colors.text,
        bg: Colors.background,
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
        fg: Colors.text
    }
});
Term.append(clockWindow);

const ptopHostText: Widgets.TextElement = Blessed.text({
    top: 0,
    left: 1,
    width: '100%-20',
    height: 1,
    content: `{${Colors.primary}-fg}ptop{/} for ${hostname()}`,
    tags: true,
    style: {
        fg: Colors.text
    }
});
Term.append(ptopHostText);

const ptopStatusText: Widgets.TextElement = Blessed.text({
    bottom: 0,
    left: 1,
    width: '50%',
    height: 1,
    content: `Started at ${getTime()}`,
    tags: true,
    style: {
        fg: Colors.text
    }
});
Term.append(ptopStatusText);

const ptopHintText: Widgets.TextElement = Blessed.text({
    bottom: 0,
    right: 1,
    width: '50%',
    height: 1,
    align: 'right',
    content: `{${Colors.background}-fg}{${Colors.text}-bg}dd{/} Clear history`,
    tags: true,
    style: {
        fg: Colors.text
    }
});
Term.append(ptopHintText);

Term.render();

const startTime: number = Date.now();

function updateInfo () {
    pingStatsInfoWindow.setContent(`There have been {${Colors.primary}-fg}${slowPackets + droppedPackets}{/} issues!`);
    const packetLoss = round(droppedPackets / totalPackets) * 100;
    let color = Colors.okay;
    if (packetLoss > 0.01) {
        color = Colors.warning;
    }
    if (packetLoss > 0.1) {
        color = Colors.error;
    }
    pingStatsInfoWindow.insertBottom(`{${color}-fg}${packetLoss}%{/} have been dropped`);
    const packetSlow = round(slowPackets / totalPackets) * 100;
    color = Colors.okay;
    if (packetSlow > 0.01) {
        color = Colors.warning;
    }
    if (packetSlow > 0.1) {
        color = Colors.error;
    }
    pingStatsInfoWindow.insertBottom(`{${color}-fg}${packetSlow}%{/} have been exceedingly slow`);

    pingStatsInfoWindow.insertBottom(`\nptop has been running for ${getTime(new Date(Date.now() - startTime - (new Date(1970, 0, 1, 1, (new Date()).getTimezoneOffset())).getTime()))}`);
}

function round (input: number, places: number = 2): number {
    return Math.round(input * Math.pow(10, places)) / Math.pow(10, places);
}

function getTime (date: Date = new Date()): string {
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
    return `${hours}:${minutes}:${seconds}`;
}

const latencyChart = new Chart(latencyChartWindow);

function loop () {
    latencyChartWindow.content = latencyChart.render();

    clockWindow.content = getTime();

    updateInfo();

    Term.render();
}

let totalPackets = 0;
let slowPackets = 0;
let droppedPackets = 0;

function ping () {
    totalPackets++;
    Ping().then((res) => {
        let color = Colors.okay;
        if (res.time > 100) {
            color = Colors.warning;
        }
        latencyChartLabel.content = `{right}{${color}-fg}${Math.round(res.time)}ms{/}`;
        latencyChart.data.splice(0, 0, res.time);
        if (res.time > 100) {
            slowPackets++;
            pingStatsLogWindow.insertBottom(`[{${Colors.textSubdued}-fg}${getTime()}{/}] {${Colors.warning}-fg}High ping!{/} ${res.host}: ${res.time}ms`);
        }
    }).catch((err: PingResult) => {
        droppedPackets++;
        latencyChartLabel.content = `{right}{${Colors.error}-rg}∞ms{/}{/right}`;
        pingStatsLogWindow.insertBottom(`[{${Colors.textSubdued}-fg}${getTime()}{/}] {${Colors.error}-fg}Timeout!{/} ${err.host}: ${err.time ? err.time : '∞'}ms`);
    });
}

setInterval(loop, 1000 / 30);
setInterval(ping, 1000);
