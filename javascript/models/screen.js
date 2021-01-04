/**
 * Handles drawing sprites, redrawing sprites,
 * clearing sprites, clearing the canvas, and all other display actions
 */
export default class Screen {
  constructor() {
    this.displayWidth = 64;
    this.displayHeight = 32;
    this.resolution = this.displayHeight * this.displayWidth;

    // the display memory array
    this.screen = new Array(this.resolution);
    this.canvas = null;
    this.blinkReductionLevel = 0;
    this.vfFrame = 0;
    this.skipped = 0;
  }

  /**
   * reduces blinking based on vf frame being on or off
   * and the level selected
   */
  blinkReduction() {
    if (this.blinkReductionLevel) {
      if (this.blinkReductionLevel === 2 && this.skipped > 1 && !this.vfFrame) {
        if (this.skipped === 2) {
          this.skipped = 0;
        } else {
          this.skipped -= 1;
        }
        return true;
      }

      if (this.vfFrame) {
        this.skipped += 1;
        return true;
      }
      this.skipped = 0;
    }
    return false;
  }

  /**
   * Clears the screen memory
   */
  clearScreen() {
    for (let i = 0; i < this.screen.length; i += 1) {
      this.screen[i] = 0;
    }
  }

  /**
   * Sets the X and Y axis pixels to on in memory
   * @param {Number} x coordinate
   * @param {Number} y coordinate
   * @returns {number} flipped bit on the screen that just got drawn
   */
  setPixels(x, y) {
    // if pixels overflow dimensions
    // wrap around
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

    // on the (x, y) axis, flip the bit
    const location = x + (y * this.displayWidth);
    this.screen[location] ^= 1;
    return this.screen[location];
  }

  /**
   * Set the canvas context
   * @param {*} context canvas context
   * @param {*} scale scale to scale up with
   */
  setCanvas(context, scale) {
    this.scale = scale || 10;
    this.width = context.canvas.width = this.displayWidth * this.scale;
    this.height = context.canvas.height = this.displayHeight * this.scale;
    this.canvas = context;
  }

  /**
   * Renders the memory into the canvas
   */
  render() {
    if (this.blinkReduction()) return;
    let x;
    let y;
    this.canvas.clearRect(0, 0, this.width, this.height);

    // rerender whole canvas based on the resolution and display memory
    for (let i = 0; i < this.resolution; i += 1) {
      x = (i % this.displayWidth) * this.scale;
      y = Math.floor(i / this.displayWidth) * this.scale;
      if (this.screen[i]) {
        this.canvas.fillStyle = '#FFFFFF';
        this.canvas.fillRect(x, y, this.scale, this.scale);
      }
    }
  }
}
