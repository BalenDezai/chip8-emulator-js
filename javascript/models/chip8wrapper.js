(function () {
  const Chip8Wrapper = function Chip8Wrapper() {
    let loop = 0;
    this.chip8 = window.chip8;
    this.ROMS = [];
    let step = 0;
    const self = this;

    this.loadROMNames = async function () {
      const romNames = await fetch('https://balend.github.io/chip8-emulator-js/roms/names.txt');
      const test = await romNames.text();
      self.ROMS = test.split('.');
    };

    this.loadROM = async function (name) {
      const ROMData = await fetch(`https://balend.github.io/chip8-emulator-js/roms/${name}`);
      self.stop();
      self.chip8.resetState();
      self.chip8.loadROM(new Uint8Array(await ROMData.arrayBuffer()));
      self.start();
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
