import { atom } from 'jotai';

import { store } from 'lib/store';
import { callAPI, addRequestListener, RequestSample } from 'lib/api';
import { coreInfoQuery } from 'lib/coreInfo';
import { lastBlockAt, restartsToday } from 'lib/coreHealth';

export type Quality = 'good' | 'fair' | 'poor' | 'bad';

export interface QualityItem {
  id: 'response' | 'unanswered' | 'behind' | 'lastBlock' | 'peers' | 'restarts';
  quality: Quality;
  value: number;
  //second value where one item shows two numbers (total requests, peer latency)
  extra?: number;
}

export interface ConnectionQuality {
  quality: Quality;
  connected: boolean;
  syncing: boolean;
  items: QualityItem[];
}

const windowMs = 600000;
//response time follows the last minutes so a slowdown shows soon
const responseWindowMs = 180000;
const updateSeconds = 10;
const peersSeconds = 60;
//only this light call is timed, big list calls would make a fast core look slow
const timedEndpoint = 'system/get/info';
//latency the core reports for a peer it has not measured yet
const unmeasuredLatency = 4294967295;

const order: Quality[] = ['good', 'fair', 'poor', 'bad'];
const worst = (list: Quality[]) =>
  list.reduce((w, q) => (order.indexOf(q) > order.indexOf(w) ? q : w), 'good');

//upper limits for good, fair, poor; anything above is bad
function grade(value: number, limits: [number, number, number]): Quality {
  if (value <= limits[0]) return 'good';
  if (value <= limits[1]) return 'fair';
  if (value <= limits[2]) return 'poor';
  return 'bad';
}

//typical value; a few slow answers (startup burst, one far peer) do not drag it
function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

let samples: (RequestSample & { at: number })[] = [];
let peers: { count: number; latency: number; network: number } | null = null;

export const connectionQualityAtom = atom<ConnectionQuality | null>(null);

function recentSamples() {
  const since = Date.now() - windowMs;
  samples = samples.filter((s) => s.at >= since);
  return samples;
}

async function loadPeers() {
  if (!store.get(coreInfoQuery.valueAtom)) return;
  try {
    const list = await callAPI('system/list/peers');
    const all = Array.isArray(list) ? list : [];
    const latencies = all
      .map((p) => Number(p?.latency))
      .filter((l) => l > 0 && l < unmeasuredLatency);
    const heights = all
      .map((p) => Number(p?.height) || 0)
      .filter((h) => h > 0)
      .sort((a, b) => b - a);
    peers = {
      count: all.length,
      latency: latencies.length ? median(latencies) : 0,
      //second best height, one odd peer cannot make the core look behind
      network: heights.length >= 2 ? heights[1] : 0,
    };
  } catch {
    peers = null;
  }
}

/** Rates the connection from what the wallet already sees */
export function rateConnection(input: {
  connected: boolean;
  syncing: boolean;
  privateChain: boolean;
  blocks?: number;
  samples: (RequestSample & { at: number })[];
  now: number;
  peers: typeof peers;
  lastBlockAgo: number;
  restarts: number;
}): ConnectionQuality {
  const items: QualityItem[] = [];
  const timed = input.samples.filter(
    (s) =>
      s.endpoint === timedEndpoint &&
      s.answered &&
      s.at >= input.now - responseWindowMs
  );
  if (timed.length) {
    const typical = median(timed.map((s) => s.ms));
    items.push({
      id: 'response',
      quality: grade(typical, [300, 1000, 3000]),
      value: typical,
    });
  }
  const total = input.samples.length;
  if (total) {
    const missed = input.samples.filter((s) => !s.answered).length;
    items.push({
      id: 'unanswered',
      quality: missed ? grade(missed / total, [0, 0.02, 0.1]) : 'good',
      value: missed,
      extra: total,
    });
  }
  if (input.connected && !input.syncing && !input.privateChain) {
    if (input.peers?.network && typeof input.blocks === 'number') {
      const behind = Math.max(0, input.peers.network - input.blocks);
      items.push({
        id: 'behind',
        quality: grade(behind, [1, 3, 10]),
        value: behind,
      });
    }
    const minutes = input.lastBlockAgo / 60000;
    items.push({
      id: 'lastBlock',
      quality: grade(minutes, [3, 6, 15]),
      value: input.lastBlockAgo,
    });
    if (input.peers) {
      const { count, latency } = input.peers;
      const byCount: Quality =
        count >= 8 ? 'good' : count >= 4 ? 'fair' : count >= 1 ? 'poor' : 'bad';
      const byLatency = latency ? grade(latency, [300, 800, 2000]) : 'good';
      items.push({
        id: 'peers',
        quality: worst([byCount, byLatency]),
        value: count,
        extra: latency,
      });
    }
  }
  items.push({
    id: 'restarts',
    quality: grade(input.restarts, [0, 1, 3]),
    value: input.restarts,
  });
  return {
    quality: input.connected ? worst(items.map((i) => i.quality)) : 'bad',
    connected: input.connected,
    syncing: input.syncing,
    items,
  };
}

function update() {
  const info = store.get(coreInfoQuery.valueAtom);
  store.set(
    connectionQualityAtom,
    rateConnection({
      connected: !!info,
      syncing: !!info?.syncing,
      privateChain: !!info?.private,
      blocks: info?.blocks,
      samples: recentSamples(),
      now: Date.now(),
      peers,
      lastBlockAgo: Date.now() - lastBlockAt(),
      restarts: restartsToday(),
    })
  );
}

export function prepareConnectionQuality() {
  addRequestListener((sample) => {
    samples.push({ ...sample, at: Date.now() });
  });
  loadPeers();
  setInterval(loadPeers, peersSeconds * 1000);
  setInterval(update, updateSeconds * 1000);
  update();
}
