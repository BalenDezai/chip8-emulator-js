class Screen {
  constructor() {
    // row
    this.x = 32;
    // column
    this.y = 64;

    this.resolution = this.y * this.x;

    this.screen = new Array(this.resolution);
  }

  clearScreen() {
    //  instead of assigning a new array, could also set all values to using a for loop
    this.screen = new Array(this.resolution);
  }

  setPixels(x, y) {
    if (x > (this.x - 1)) {
      while (x > (this.x - 1)) {
        x -= this.x;
      }
    }

    if (x < 0) {
      while (x < 0) {
        x += this.x;
      }
    }

    if (y > (this.y - 1)) {
      while (y > (this.y - 1)) {
        y -= this.y;
      }
    }

    if (y < 0) {
      while (y < 0) {
        y += this.y;
      }
    }

    const location = x + (y * this.y);

    this.screen[location] ^= location;
  }
}

module.exports = Screen;
