import autoBind from "../utils/autobinder.js";

/**
 * Handles key press and keyboard instructions
 */
export default class Keyboard {
  constructor() {
    autoBind(this);
    this.keysPressed = [];
    this.onNextKeyPress = function () {};
    // custom mapping from key pressed to hex
    // does not follow the technical reference mapping
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

  /**
   * event handler for keyDown event
   * simulates key being pressed
   * @param {KeyboardEvent} event args passed from event
   */
  keyDown(event) {
    // decode from code to string
    const key = String.fromCharCode(event.which);
    // insert to know which key from the mapping was pressed
    this.keysPressed[key] = true;
    Object.entries(this.keyMapping).forEach(([oKey, oVal]) => {
      const keyCode = this.keyMapping[oVal];
      // if key pressed exists
      if (keyCode === key) {
        try {
          this.onNextKeyPress(parseInt(oKey, 10));
        } finally {
          this.onNextKeyPress = function () {};
        }
      }
    });
  }

  /**
   * event handler for keyUp event
   * simulates key being unpressed
   * @param {KeyboardEvent} event args passed from event
   */
  keyUp(event) {
    const key = String.fromCharCode(event.which);
    this.keysPressed[key] = false;
  }

  isKeyPressed(keyCode) {
    const keyPressed = this.keyMapping[keyCode];
    // return the values truthy value
    return !!this.keysPressed[keyPressed];
  }

  /**
   * clears all keys pressed
   */
  clear() {
    this.keysPressed = [];
  }
}
