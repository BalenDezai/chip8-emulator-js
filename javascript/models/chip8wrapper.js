(function () {
  const Chip8Wrapper = function Chip8Wrapper() {
    let loop = 0;
    const { chip8 } = window;
    let step = 0;
    const self = this;
    const ROMS = [
      'pong',
    ];

    this.loadROM = function (name) {
      const request = new XMLHttpRequest();
      request.onload = () => {
        if (request.response) {
          self.stop();
          chip8.resetState();
          chip8.loadROM(new Uint8Array(request.response));
          self.start();
        }
      };
      request.open('GET', `roms/${name}`, true);
      request.responseType = 'arraybuffer';
      request.send();
    };

    step = () => {
      chip8.emulateCycle();
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
    window.chip8emu = Chip8Wrapper;
  }
}());
