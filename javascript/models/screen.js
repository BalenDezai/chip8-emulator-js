class Screen {
  constructor() {
    // row
    this.x = 32;
    // column
    this.y = 64;

    this.resolution = this.y * this.x;

    this.screen = new Array(this.resolution);
    this.canvas = null;
    this.scale = null;
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

    return !this.screen[location];
  }

  ApplyCanvas(context, scale) {
    this.scale = scale || 10;

    this.width = context.canvas.width = this.y * this.scale;
    this.height = context.canvas.width = this.x * this.scale;
    this.canvas = context;
  }

  render() {
    let x;
    let y;
    this.canvas.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.resolution; i += 1) {
      x = (i % this.y) * this.scale;
      y = Math.floor(i / this.x) * this.scale;
      if (this.screen[i]) {
        this.context.fillStyle = '#000';
        this.context.fillRect(x, y, this.scale, this.scale);
      }
    }
  }
}

module.exports = Screen;
