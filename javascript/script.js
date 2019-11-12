import Chip8Wrapper from './models/chip8wrapper.js';

(async function () {
  const emulator = new Chip8Wrapper();
  const canvas = document.querySelector('canvas');
  emulator.chip8.screen.applyCanvas(canvas.getContext('2d'));
  await emulator.loadROMNames();

  const debug = document.getElementById('opCodeDebugger');
  const romSelector = document.getElementById('rom_selector');
  const speedSelector = document.getElementById('speed_selector');
  const blinkSelector = document.getElementById('blink_selector');
  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnStep = document.getElementById('btn-step');
  const btnKeys = document.querySelectorAll('#keyBtn');
  const txtElements = document.querySelectorAll('p, h5, select, button, h1');

  romSelector.addEventListener('change', () => {
    if (btnStart.textContent !== 'START') {
      btnPause.click();
      btnStart.textContent = 'START';
    }
  });

  emulator.AssignDebugEle(debug);
  for (let i = 0, romsCount = emulator.ROMS.length; i < romsCount; i += 1) {
    const option = document.createElement('option');
    const rom = emulator.ROMS[i];
    option.value = option.innerHTML = rom;
    romSelector.appendChild(option);
  }


  blinkSelector.addEventListener('change', (event) => {
    emulator.chip8.screen.setBlinkLevel(event.target.value);
  });
  speedSelector.addEventListener('change', (event) => {
    emulator.chip8.setSpeed(event.target.value);
  });

  window.addEventListener('keydown', emulator.chip8.keyboard.keyDown, false);
  window.addEventListener('keyup', emulator.chip8.keyboard.keyUp, false);

  btnStart.addEventListener('click', () => {
    const name = romSelector.options[romSelector.selectedIndex].text;
    emulator.loadROM(name);
    canvas.focus();
    if (btnStart.textContent === 'START') {
      btnStart.textContent = 'RESTART';
    }
    if (btnPause.textContent === 'RESUME') {
      btnPause.classList.remove('is-primary');
      btnPause.textContent = 'PAUSE';
      btnStep.classList.add('is-disabled');
    }
  }, false);

  btnPause.addEventListener('click', () => {
    if (btnPause.textContent === 'PAUSE') {
      btnPause.textContent = 'RESUME';
      btnPause.classList.add('is-primary');
      btnStep.classList.remove('is-disabled');
    } else {
      btnPause.classList.remove('is-primary');
      btnPause.textContent = 'PAUSE';
      btnStep.classList.add('is-disabled');
    }
    emulator.chip8.pauseEmu();
  }, false);

  btnStep.addEventListener('click', () => {
    emulator.chip8.pause = false;
    emulator.chip8.emulateCycle();
    emulator.chip8.pause = true;
  });

  btnKeys.forEach((keyBtn) => {
    keyBtn.addEventListener('mousedown', () => {
      emulator.chip8.keyboard.keyDown({ which: keyBtn.value.charCodeAt(0) });
    });
    keyBtn.addEventListener('mouseup', () => {
      emulator.chip8.keyboard.keyUp({ which: keyBtn.value.charCodeAt(0) });
    });
  });

  txtElements.forEach((element) => {
    if (element.tagName === 'SELECT') {
      for (let i = 0; i < element.children.length; i += 1) {
        element.children[i].classList.add('uppercase');
      }
    }
    element.classList.add('uppercase');
  });

}());
