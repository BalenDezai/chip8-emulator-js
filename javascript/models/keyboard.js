(function () {
  const Keyboard = function () {
    let keysPressed = [];
    const keyMapping = {
      0x0: 'X',
      0x1: '1',
      0x2: '2',
      0x3: '3',
      0x4: 'Q',
      0x5: 'W',
      0x6: 'E',
      0x7: 'A',
      0x8: 'S',
      0x9: 'D',
      0xA: 'Z',
      0xB: 'C',
      0xC: '4',
      0xD: 'R',
      0xE: 'F',
      0xF: 'V',
    };
    this.onNextKeyPress = function () {};

    this.clear = () => {
      keysPressed = [];
    };

    this.isKeyPressed = (keyCode) => {
      const keyPressed = keyMapping[keyCode];
      return !!keysPressed[keyPressed];
    };

    this.keyDown = (event) => {
      const key = String.fromCharCode(event.which);
      keysPressed[key] = true;
      Object.entries(keyMapping).forEach(([oKey, oVal]) => {
        const keyCode = keyMapping[oVal];

        if (keyCode === key) {
          this.onNextKeyPress(parseInt(oKey, 16));
        }
      });
    };

    this.keyUp = (event) => {
      const key = String.fromCharCode(event.which);
      keysPressed[key] = false;
    };

    window.addEventListener('keydown', this.keyDown, false);
    window.addEventListener('keyup', this.keyUp, false);
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Keyboard;
  } else {
    window.Chip8Keyboard = Keyboard;
  }
}());
