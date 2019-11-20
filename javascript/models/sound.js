import autoBind from './../utils/autobinder.js';
/**
 * Handles playing and stopping sound on the browser sound contex
 */
export default class Sound {
  /**
   * @param {AudioContext} ctxClass audio context of the browser
   * @param {Number} frequency frequency to play at
   */
  constructor(ctxClass, frequency) {
    autoBind(this);
    this.CtxClass = ctxClass;
    this.frequency = frequency;
    if (ctxClass) {
      this.context = new this.CtxClass();
      // creates GainNode to control volume
      this.gain = this.context.createGain();
      this.gain.connect(this.context.destination);
    }
  }

  /**
   * Stops playing audio
   */
  stop() {
    this.oscillator.stop();
    this.oscillator.disconnect();
  }

  /**
   * Starts playing audio
   */
  start() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.frequency.value = this.frequency || 440;
    this.oscillator.type = this.oscillator.TRIANGLE;
    this.oscillator.connect(this.gain);
    this.oscillator.start();
    setTimeout(this.stop, 100);
  }
}
