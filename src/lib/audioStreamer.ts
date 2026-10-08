export class AudioStreamer {
  private context: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private onChunk?: (pcm16: Int16Array) => void;

  async start(onChunk: (pcm16: Int16Array) => void) {
    this.onChunk = onChunk;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000,
      },
    });

    this.context = new AudioContext({ sampleRate: 16000 });
    this.mediaStream = stream;
    this.source = this.context.createMediaStreamSource(stream);
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;

    this.processor = this.context.createScriptProcessor(4096, 1, 1);
    this.source.connect(this.analyser);
    this.analyser.connect(this.processor);
    this.processor.connect(this.context.destination);

    this.processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(input.length);

      for (let i = 0; i < input.length; i += 1) {
        const sample = Math.max(-1, Math.min(1, input[i]));
        pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      }

      this.onChunk?.(pcm16);
    };

    await this.context.resume();
  }

  stop() {
    this.processor?.disconnect();
    this.analyser?.disconnect();
    this.source?.disconnect();
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.context?.close();
    this.processor = null;
    this.analyser = null;
    this.source = null;
    this.mediaStream = null;
    this.context = null;
  }
}
