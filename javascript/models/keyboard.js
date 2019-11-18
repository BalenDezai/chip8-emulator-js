import autoBind from './../utils/autobinder.js';

export default class Keyboard {
  constructor() {
    autoBind(this);
    this.keysPressed = [];
    this.onNextKeyPress = function () {};
    this.keyMapping = {
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
  }

  keyDown(event) {
    const key = String.fromCharCode(event.which);
    this.keysPressed[key] = true;
    Object.entries(this.keyMapping).forEach(([oKey, oVal]) => {
      const keyCode = this.keyMapping[oVal];
      if (keyCode === key) {
        this.onNextKeyPress(parseInt(oKey, 10));
      }
    });
  }

  keyUp(event) {
    const key = String.fromCharCode(event.which);
    this.keysPressed[key] = false;
  }

  isKeyPressed(keyCode) {
    const keyPressed = this.keyMapping[keyCode];
    return !!this.keysPressed[keyPressed];
  }

  clear() {
    this.keysPressed = [];
  }
}
