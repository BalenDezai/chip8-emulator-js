class Keyboard {
  constructor() {
    this.keysPressed = [];
    this.onNextKeyPress = null;
    this.loadKeyMapping();
    window.addEventListener('keydown', this.keyDown, false);
    window.addEventListener('keyup', this.keyUp, false);
  }

  clear() {
    this.keyPressed = [];
  }

  isKeyPressed(keyCode) {
    const keyPressed = this.keyMapping[keyCode];
    return !!this.keyPressed[keyPressed];
  }

  keyDown(event) {
    const key = String.fromCharCode(event.which);
    this.keysPressed[key] = true;
    Object.entries(this.keyMapping).forEach(([oKey, oVal]) => {
      const keyCode = this.keyMapping[oVal];

      if (keyCode === key) {
        this.onNextKeyPress(parseInt(oKey, 16));
      }
    });
  }

  keyUp(event) {
    const key = String.fromCharCode(event.which);
    this.keysPressed[key] = false;
  }

  loadKeyMapping() {
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
}

module.exports = Keyboard;
