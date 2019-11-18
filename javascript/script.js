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
  let rowCounter = 0;

  const emulator = new Chip8Wrapper();
  emulator.setEmuCanvasCtx(canvas.getContext('2d'));
  await emulator.loadROMNames();
  emulator.setEmuSound(window.AudioContext
    || window.webkitAudioContext
    || window.mozAudioContext
    || window.oAudioContext
    || window.msAudioContext);

  const extraDebugCheckbox = function (id, event, cellWidth, creationNumBase) {
    if (event.target.checked) {
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
      registerTable.classList.remove('hidden');
      debugExtras.classList.remove('hidden');
      emulator.setEmuDebugCallback((state, numBase) => {
        let prefix = '';
        if (numBase === 16) {
          prefix = '0x';
        }

        for (let i = 0; i < 15; i += 1) {
          registerTableData[i].innerHTML = `${prefix}${state.v[i].toString(numBase)}`;
        }
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
      emulator.setEmuSoundVolume(true);
    }
  });


  soundOnCheckbox.addEventListener('change', (event) => {
    if (event.target.checked) {
      emulator.setEmuSoundVolume(false);
    }
  });

  pcCheckbox.addEventListener('change', (event) => {
    extraDebugCheckbox('pc', event, '100px', emulator.debugNumBase);
  });

  spCheckbox.addEventListener('change', (event) => {
    extraDebugCheckbox('sp', event, '100px', emulator.debugNumBase);
  });

  iCheckbox.addEventListener('change', (event) => {
    extraDebugCheckbox('i', event, '100px', emulator.debugNumBase);
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
    emulator.setEmuSpeed(event.target.value);
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
    emulator.emulateEmuCycle();
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
