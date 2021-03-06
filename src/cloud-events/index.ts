import { HTTP, CloudEvent } from 'cloudevents';
import got from 'got';
import { Agent } from 'http';
import { CLOUD_EVENT_BROKER_URL } from '../config';
import log from '../log';
import { ShipType } from '../validations';

const agent = new Agent({
  keepAlive: true
});
const source = 'battleship-wss';

const enum CloudEventType {
  Hit = 'hit',
  Miss = 'miss',
  Sink = 'sink',
  Win = 'win',
  Lose = 'lose',
  Bonus = 'bonus'
}

type EventDataBase = {
  ts: number;
  by: string;
  game: string;
  match: string;
  against: string;
  origin: `${number},${number}`;
};

type HitShotEventData = EventDataBase & {
  type: ShipType;
};

type MissShotEventData = EventDataBase;

type SinkEventData = EventDataBase & {
  type: ShipType;
};

type WinLoseEventData = {
  game: string;
  match: string;
  player: string;
};

async function sendEvent(type: CloudEventType, data: unknown) {
  const ce = HTTP.binary(
    new CloudEvent({
      type,
      source,
      data
    })
  );

  log.debug('sending cloud event: %j', ce);

  try {
    const res = await got(CLOUD_EVENT_BROKER_URL, {
      method: 'POST',
      agent: {
        http: agent
      },
      headers: ce.headers,
      body: JSON.stringify(ce.body)
    });

    log.debug(`sent cloud event and received HTTP ${res.statusCode} response`);
  } catch (e) {
    log.error('error sending cloud event:');
    log.error(e);
  }
}

export function hit(data: HitShotEventData) {
  sendEvent(CloudEventType.Hit, data);
}

export function miss(data: MissShotEventData) {
  sendEvent(CloudEventType.Miss, data);
}

export function sink(data: SinkEventData) {
  sendEvent(CloudEventType.Sink, data);
}

export function win(data: WinLoseEventData) {
  sendEvent(CloudEventType.Win, data);
}

export function lose(data: WinLoseEventData) {
  sendEvent(CloudEventType.Win, data);
}

export function bonus() {
  // TODO
}
