(function () {
  class Screen {
    constructor() {
      // row
      this.x = 32;
      // column
      this.y = 64;

      this.resolution = this.y * this.x;

      this.screen = new Array(this.resolution);
      this.canvas = null;
    }

    clearScreen() {
      //  instead of assigning a new array, could also set all values to using a for loop
      this.screen = new Array(this.resolution);
    }

    setPixels(x, y) {
      if (x > (this.y - 1)) {
        while (x > (this.y - 1)) {
          x -= this.y;
        }
      }

      if (x < 0) {
        while (x < 0) {
          x += this.y;
        }
      }

      if (y > (this.x - 1)) {
        while (y > (this.x - 1)) {
          y -= this.x;
        }
      }

      if (y < 0) {
        while (y < 0) {
          y += this.x;
        }
      }

      const location = x + (y * this.y);

      this.screen[location] = this.screen[location] ^ 1;

      return !this.screen[location];
    }

    applyCanvas(context, scale) {
      this.scale = scale || 10;
      this.width = context.canvas.width = this.y * this.scale;
      this.height = context.canvas.height = this.x * this.scale;
      this.canvas = context;
    }

    render() {
      let x;
      let y;
      this.canvas.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.resolution; i += 1) {
        x = (i % this.y) * this.scale;
        y = Math.floor(i / this.y) * this.scale;
        if (this.screen[i]) {
          this.canvas.fillStyle = '#FFFFFF';
          this.canvas.fillRect(x, y, this.scale, this.scale);
        }
      }
    }
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Screen;
  } else {
    window.Chip8Screen = Screen;
  }
}());
