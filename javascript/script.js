import Chip8Wrapper from './chip8wrapper.js';

(async function () {
  const canvas = document.querySelector('canvas');
  const romSelector = document.getElementById('rom_selector');
  const speedSelector = document.getElementById('speed_selector');
  const blinkSelector = document.getElementById('blink_selector');
  const numBaseSelector = document.getElementById('numBase_selector');
  const debugRegCheckbox = document.getElementById('register-debug-checkbox');
  const pcCheckbox = document.getElementById('pc-checkbox');
  const spCheckbox = document.getElementById('sp-checkbox');
  const iCheckbox = document.getElementById('i-checkbox');
  const soundOffCheckbox = document.getElementById('sound-off-checkbox');
  const soundOnCheckbox = document.getElementById('sound-on-checkbox');
  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnStep = document.getElementById('btn-step');
  const btnKeys = document.querySelectorAll('#keyBtn');
  const txtElements = document.querySelectorAll('p, h5, select, button, h1, th, span');
  const registerTable = document.getElementById('register-table');
  const registerTableData = registerTable.getElementsByTagName('td');
  const debugExtras = document.getElementById('debug-extra');
  // to check if there are exactly 0 or extra debug elements are shown
  let rowCounter = 0;

  // start up the emulator and assign things needed
  const emulator = new Chip8Wrapper();
  emulator.setEmuCanvasCtx(canvas.getContext('2d'));
  await emulator.loadROMNames();
  emulator.setEmuSoundCtx(window.AudioContext
    || window.webkitAudioContext
    || window.mozAudioContext
    || window.oAudioContext
    || window.msAudioContext);

  /**
   * Create or remove table cells
   * @param {string} id id to assign cell after creation
   * @param {boolean} checked whether a checkbox is checked or not
   * @param {number} cellWidth width size of the cell to create
   * @param {number} creationNumBase to determine what the cell should contain
   */
  const extraDebugCheckbox = function (id, checked, cellWidth, creationNumBase) {
    if (checked) {
      const thTr = document.getElementById('extra-debug-th-tr');
      const tdTr = document.getElementById('extra-debug-td-tr');
      const headerCell = thTr.insertCell();
      headerCell.id = `${id}-th`;
      headerCell.classList.add('uppercase');
      headerCell.width = cellWidth;
      headerCell.innerHTML = id;
      const dataCell = tdTr.insertCell();
      dataCell.width = cellWidth;
      dataCell.id = `${id}-td`;
      if (creationNumBase === 10) {
        dataCell.innerHTML = '00';
      } else {
        dataCell.innerHTML = '0x';
      }
      rowCounter += 1;
    } else {
      const Th = document.getElementById(`${id}-th`);
      const Td = document.getElementById(`${id}-td`);
      Th.remove();
      Td.remove();
      rowCounter -= 1;
    }
    const extraDebugResterTable = document.getElementById('extra-register-table');
    if (rowCounter === 0) {
      extraDebugResterTable.classList.add('hidden');
    } else if (rowCounter > 0) {
      extraDebugResterTable.classList.remove('hidden');
    }
  };

  debugRegCheckbox.addEventListener('change', (event) => {
    if (event.target.checked) {
      // show the tables
      registerTable.classList.remove('hidden');
      debugExtras.classList.remove('hidden');
      emulator.setEmuDebugFunc((state, numBase) => {
        let prefix = '';
        if (numBase === 16) {
          prefix = '0x';
        }

        // write out each V register from 0 to f to the cells
        for (let i = 0; i < 15; i += 1) {
          registerTableData[i].innerHTML = `${prefix}${state.v[i].toString(numBase)}`;
        }

        // write out the stack pointer, program counter, and i addresses and registers
        const sp = document.getElementById('sp-td');
        if (sp) {
          sp.innerHTML = `${prefix}${state.stackPointer.toString(numBase)}`;
        }

        const pc = document.getElementById('pc-td');
        if (pc) {
          pc.innerHTML = `${prefix}${state.programCounter.toString(numBase)}`;
        }

        const MemAddr = document.getElementById('i-td');
        if (sp) {
          MemAddr.innerHTML = `${prefix}${state.i.toString(numBase)}`;
        }
      });
    } else {
      registerTable.classList.add('hidden');
      debugExtras.classList.add('hidden');
      emulator.setEmuDebugCallback(() => {});
    }
  });

  soundOffCheckbox.addEventListener('change', (event) => {
    if (event.target.checked) {
      emulator.setEmuSoundEnabled(true);
    }
  });


  soundOnCheckbox.addEventListener('change', (event) => {
    if (event.target.checked) {
      emulator.setEmuSoundEnabled(false);
    }
  });

  pcCheckbox.addEventListener('change', (event) => {
    extraDebugCheckbox('pc', event.target.checked, '85px', emulator.debugNumBase);
  });

  spCheckbox.addEventListener('change', (event) => {
    extraDebugCheckbox('sp', event.target.checked, '85px', emulator.debugNumBase);
  });

  iCheckbox.addEventListener('change', (event) => {
    extraDebugCheckbox('i', event.target.checked, '80px', emulator.debugNumBase);
  });

  numBaseSelector.addEventListener('change', (event) => {
    const numBase = parseInt(event.target.value, 10);
    const extraDebugTable = document.getElementById('extra-register-table').getElementsByTagName('td');
    if (numBase === 10) {
      for (let i = 0; i < registerTableData.length; i += 1) {
        registerTableData[i].innerHTML = '0';
      }
      for (let i = 0; i < extraDebugTable.length; i += 1) {
        extraDebugTable[i].innerHTML = '0';
      }
    } else if (numBase === 16) {
      for (let i = 0; i < registerTableData.length; i += 1) {
        registerTableData[i].innerHTML = '0x';
      }
      for (let i = 0; i < extraDebugTable.length; i += 1) {
        extraDebugTable[i].innerHTML = '0x';
      }
    }
    emulator.setEmuDebugNumBase(numBase);
  });

  romSelector.addEventListener('change', () => {
    if (btnStart.textContent !== 'START') {
      btnPause.click();
      btnStart.textContent = 'START';
    }
  });

  for (let i = 0, romsCount = emulator.ROMS.length; i < romsCount; i += 1) {
    const option = document.createElement('option');
    const rom = emulator.ROMS[i];
    option.value = option.innerHTML = rom;
    romSelector.appendChild(option);
  }


  blinkSelector.addEventListener('change', (event) => {
    emulator.setEmuScreenBlinkLevel(event.target.value);
  });
  speedSelector.addEventListener('change', (event) => {
    emulator.setEmuSpeed(parseInt(event.target.value, 10));
  });

  window.addEventListener('keydown', emulator.keyDownEvent, false);
  window.addEventListener('keyup', emulator.keyUpEvent, false);

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
    emulator.pauseEmu();
  }, false);

  btnStep.addEventListener('click', () => {
    emulator.pauseEmu();
    emulator.emulateCycle();
    emulator.pauseEmu();
  });

  btnKeys.forEach((keyBtn) => {
    keyBtn.addEventListener('mousedown', () => {
      emulator.emuKeyDown(keyBtn.value.charCodeAt(0));
    });
    keyBtn.addEventListener('mouseup', () => {
      emulator.emuKeyUp(keyBtn.value.charCodeAt(0));
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
