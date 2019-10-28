(function () {
  class Screen {
    constructor() {
      this.displayWidth = 64;
      this.displayHeight = 32;

      this.resolution = this.displayHeight * this.displayWidth;

      this.screen = new Array(this.resolution);
      this.canvas = null;
    }

    clearScreen() {
      //  instead of assigning a new array, could also set all values to using a for loop
      this.screen = new Array(this.resolution);
    }

    setPixels2(x, y) {
      if (x > this.displayWidth) {
        x -= this.displayWidth;
      }

      if (x < 0) {
        x += this.displayWidth;
      }

      if (y > this.displayHeight) {
        y -= this.displayHeight;
      }

      if (y < 0) {
        y += this.displayHeight;
      }

      const location = x + (y * this.displayWidth);
      this.screen[location] ^= 1;
      return !this.screen[location];
    }

    setPixels(x, y) {
      if (x > (this.displayHeight - 1)) {
        while (x > (this.displayHeight - 1)) {
          x -= this.displayHeight;
        }
      }

      if (x < 0) {
        while (x < 0) {
          x += this.displayHeight;
        }
      }

      if (y > (this.displayWidth - 1)) {
        while (y > (this.displayWidth - 1)) {
          y -= this.displayWidth;
        }
      }

      if (y < 0) {
        while (y < 0) {
          y += this.displayWidth;
        }
      }

      const location = x + (y * this.displayHeight);

      this.screen[location] = this.screen[location] ^ 1;

      return !this.screen[location];
    }

    applyCanvas(context, scale) {
      this.scale = scale || 10;
      this.width = context.canvas.width = this.displayWidth * this.scale;
      this.height = context.canvas.height = this.displayHeight * this.scale;
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
