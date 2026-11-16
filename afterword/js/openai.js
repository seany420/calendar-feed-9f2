// OpenAI calls: realtime voice over WebRTC, transcription, and summaries.
// The key is the user's own and is sent only to api.openai.com.

const API = 'https://api.openai.com/v1';

async function apiError(r) {
  let msg = '';
  try { msg = (await r.json())?.error?.message || ''; } catch { /* not json */ }
  if (r.status === 401) return new Error('OpenAI rejected the API key. Check it in Settings.');
  if (r.status === 429) return new Error('OpenAI says the account is out of credit or over its rate limit. ' + msg);
  if (r.status === 404 || /model/i.test(msg)) return new Error((msg || 'Model not found.') + ' You can pick a different model in Settings.');
  return new Error(msg || `OpenAI error ${r.status}`);
}

function net(e) {
  if (e instanceof TypeError) return new Error('Could not reach OpenAI. Check your connection.');
  return e;
}

export class VoiceSession {
  // opts: { apiKey, model, voice, sttModel, instructions, onState, onTurns, onError, onEnd }
  constructor(opts) {
    this.o = opts;
    this.turns = [];
    this.byItem = new Map();
    this.state = 'idle';
    this.closed = false;
    this.startedAt = Date.now();
  }

  set(state) {
    if (this.closed || this.state === state) return;
    this.state = state;
    this.o.onState?.(state);
  }

  turn(itemId, role) {
    let t = this.byItem.get(itemId);
    if (!t) {
      t = { role, text: '', at: Date.now() };
      this.byItem.set(itemId, t);
      this.turns.push(t);
    }
    return t;
  }

  async start() {
    const o = this.o;
    this.set('mic');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (e) {
      throw new Error(e.name === 'NotAllowedError'
        ? 'Microphone access was blocked. Allow it for this site in your browser settings.'
        : 'No microphone found.');
    }
    if (this.closed) return this.cleanup();
    this.set('connecting');

    const session = {
      type: 'realtime',
      model: o.model,
      instructions: o.instructions,
      audio: {
        input: {
          transcription: { model: o.sttModel === 'whisper-1' ? 'whisper-1' : 'gpt-4o-mini-transcribe' },
          noise_reduction: { type: 'near_field' },
          // Low eagerness: the model waits through pauses instead of jumping in.
          turn_detection: { type: 'semantic_vad', eagerness: 'low', create_response: true, interrupt_response: true },
        },
        output: { voice: o.voice },
      },
    };

    let secret;
    try {
      const r = await fetch(`${API}/realtime/client_secrets`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${o.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ session }),
      });
      if (!r.ok) throw await apiError(r);
      secret = (await r.json()).value;
    } catch (e) { this.cleanup(); throw net(e); }
    if (this.closed) return this.cleanup();

    const pc = (this.pc = new RTCPeerConnection());
    this.audio = new Audio();
    this.audio.autoplay = true;
    this.audio.playsInline = true;
    pc.ontrack = (e) => { this.audio.srcObject = e.streams[0]; this.audio.play?.().catch(() => {}); };
    this.stream.getTracks().forEach((t) => pc.addTrack(t, this.stream));

    const dc = (this.dc = pc.createDataChannel('oai-events'));
    dc.onmessage = (e) => { try { this.handle(JSON.parse(e.data)); } catch { /* ignore */ } };
    dc.onopen = () => {
      this.set('thinking');
      this.send({ type: 'response.create' }); // the companion speaks first
    };
    dc.onclose = () => this.end('The call ended.');
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') this.end('The connection dropped.');
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const r = await fetch(`${API}/realtime/calls`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/sdp' },
        body: offer.sdp,
      });
      if (!r.ok) throw await apiError(r);
      const sdp = await r.text();
      if (this.closed) return this.cleanup();
      await pc.setRemoteDescription({ type: 'answer', sdp });
    } catch (e) { this.cleanup(); throw net(e); }
  }

  send(ev) {
    if (this.dc?.readyState === 'open') this.dc.send(JSON.stringify(ev));
  }

  sendText(text) {
    this.turns.push({ role: 'user', text, at: Date.now() });
    this.o.onTurns?.(this.turns);
    this.send({ type: 'conversation.item.create', item: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] } });
    this.send({ type: 'response.create' });
    this.set('thinking');
  }

  setMuted(muted) {
    this.muted = muted;
    this.stream?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }

  handle(ev) {
    switch (ev.type) {
      case 'input_audio_buffer.speech_started':
        this.turn(ev.item_id, 'user');
        this.set('hearing');
        break;
      case 'input_audio_buffer.speech_stopped':
        this.set('thinking');
        break;
      case 'conversation.item.input_audio_transcription.delta':
        this.turn(ev.item_id, 'user').text += ev.delta || '';
        this.o.onTurns?.(this.turns);
        break;
      case 'conversation.item.input_audio_transcription.completed':
        this.turn(ev.item_id, 'user').text = (ev.transcript || '').trim();
        this.o.onTurns?.(this.turns);
        break;
      case 'response.output_audio_transcript.delta':
      case 'response.output_text.delta':
        this.turn(ev.item_id, 'assistant').text += ev.delta || '';
        this.o.onTurns?.(this.turns);
        break;
      case 'response.output_audio_transcript.done':
        this.turn(ev.item_id, 'assistant').text = ev.transcript || this.turn(ev.item_id, 'assistant').text;
        this.o.onTurns?.(this.turns);
        break;
      case 'output_audio_buffer.started':
        this.set('speaking');
        break;
      case 'output_audio_buffer.stopped':
      case 'output_audio_buffer.cleared':
        this.set('listening');
        break;
      case 'response.done':
        if (ev.response?.status === 'failed') {
          this.o.onError?.(ev.response.status_details?.error?.message || 'The companion could not respond.');
          this.set('listening');
        } else if (this.state === 'thinking') {
          this.set('listening');
        }
        break;
      case 'error':
        this.o.onError?.(ev.error?.message || 'Something went wrong on the call.');
        break;
    }
  }

  cleanup() {
    try { this.dc?.close(); } catch { /* */ }
    try { this.pc?.close(); } catch { /* */ }
    this.stream?.getTracks().forEach((t) => t.stop());
    if (this.audio) { this.audio.pause(); this.audio.srcObject = null; }
  }

  end(reason) {
    if (this.closed) return;
    const cb = this.o.onEnd;
    this.closed = true;
    this.cleanup();
    cb?.(reason);
  }

  stop() {
    this.closed = true;
    this.cleanup();
  }

  cleanTurns() {
    return this.turns.filter((t) => t.text && t.text.trim()).map((t) => ({ role: t.role, text: t.text.trim(), at: t.at }));
  }
}

export async function transcribe({ apiKey, model, blob, mime }) {
  const ext = /mp4|m4a|aac/.test(mime) ? 'm4a' : /ogg/.test(mime) ? 'ogg' : /wav/.test(mime) ? 'wav' : 'webm';
  const fd = new FormData();
  fd.append('file', new File([blob], `memory.${ext}`, { type: mime.split(';')[0] }));
  fd.append('model', model);
  try {
    const r = await fetch(`${API}/audio/transcriptions`, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: fd });
    if (!r.ok) throw await apiError(r);
    return ((await r.json()).text || '').trim();
  } catch (e) { throw net(e); }
}

export async function summarize({ apiKey, model, system, text }) {
  try {
    const r = await fetch(`${API}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: text }],
      }),
    });
    if (!r.ok) throw await apiError(r);
    return JSON.parse((await r.json()).choices[0].message.content);
  } catch (e) { throw net(e); }
}
