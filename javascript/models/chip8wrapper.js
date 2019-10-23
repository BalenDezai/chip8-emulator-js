(function () {
  const Chip8Wrapper = function Chip8Wrapper() {
    let loop = 0;
    this.chip8 = window.chip8;
    let step = 0;
    const self = this;
    this.ROMS = [];

    this.loadROMNames = function () {
      fetch('https://balend.github.io/chip8-emulator-js/roms/names.txt')
        .then((response) => {
          if (!response.ok) {
            throw new Error('http request to fail ROM names failed');
          }
          response.text().then((names) => {
            const romNames = names.split('.');
            romNames.forEach((romName) => self.ROMS.push(romName));
          });
        });
    };

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
