import autoBind from './../utils/autobinder.js';

export default class Sound {
  constructor(ctxClass, frequency) {
    autoBind(this);
    this.CtxClass = ctxClass;
    this.frequency = frequency;
    if (ctxClass) {
      this.context = new this.CtxClass();
      this.gain = this.context.createGain();
      this.gain.connect(this.context.destination);
    }
  }

  stop() {
    this.oscillator.stop();
    this.oscillator.disconnect();
  }

  start() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.frequency.value = this.frequency || 440;
    this.oscillator.type = this.oscillator.TRIANGLE;
    this.oscillator.connect(this.gain);
    this.oscillator.start();
    setTimeout(this.stop, 100);
  }

  clear() {
    this.stop();
  }
}
