(function () {
  const Chip8Wrapper = function Chip8Wrapper() {
    let loop = 0;
    this.chip8 = window.chip8;
    let step = 0;
    const self = this;
    this.ROMS = [
      'pong',
    ];

    this.loadROM = function (name) {
      const request = new XMLHttpRequest();
      request.onload = () => {
        if (request.response) {
          self.stop();
          self.chip8.resetState();
          self.chip8.loadROM(new Uint8Array(request.response));
          self.start();
        }
      };
      request.open('GET', `https://balend.github.io/chip8-emulator-js/roms/${name}`, true);
      request.responseType = 'arraybuffer';
      request.send();
    };

    step = () => {
      self.chip8.emulateCycle();
      loop = requestAnimationFrame(step);
    };

    this.start = () => {
      loop = requestAnimationFrame(step);
    };

    this.stop = () => {
      cancelAnimationFrame(loop);
    };
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Chip8Wrapper;
  } else {
    window.Chip8Wrapper = Chip8Wrapper;
  }
}());
