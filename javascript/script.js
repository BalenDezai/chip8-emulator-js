import Chip8Wrapper from './chip8wrapper.js';

(async function () {
  const emulator = new Chip8Wrapper();
  const canvas = document.querySelector('canvas');
  emulator.chip8.screen.applyCanvas(canvas.getContext('2d'));
  await emulator.loadROMNames();

  const debug = document.getElementById('opCodeDebugger');
  const romSelector = document.getElementById('rom_selector');
  const speedSelector = document.getElementById('speed_selector');
  const blinkSelector = document.getElementById('blink_selector');
  const debugSelector = document.getElementById('debug_selector');
  const numBaseSelector = document.getElementById('numBase_selector');
  const pcCheckbox = document.getElementById('pc-checkbox');
  const spCheckbox = document.getElementById('sp-checkbox');
  const iCheckbox = document.getElementById('i-checkbox');
  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnStep = document.getElementById('btn-step');
  const btnKeys = document.querySelectorAll('#keyBtn');
  const txtElements = document.querySelectorAll('p, h5, select, button, h1, th');
  const registerDebugTable = document.getElementById('register-debug-table');
  const registerTable = document.getElementById('register-table');
  const registerTableTableRow = registerTable.getElementsByTagName('tr');
  const registerTableData = registerTable.getElementsByTagName('tr')[1].getElementsByTagName('td');
  const debugExtras = document.getElementById('debug-extra');

  const extraDebugCheckbox = function (id, event, cellWidth, creationNumBase) {
    if (event.target.checked) {
      const headerCell = registerTableTableRow[0].insertCell();
      headerCell.id = `${id}-th`;
      headerCell.classList.add('uppercase');
      headerCell.width = cellWidth;
      headerCell.innerHTML = id;
      const dataCell = registerTableTableRow[1].insertCell();
      dataCell.width = cellWidth;
      dataCell.id = `${id}-td`;
      if (creationNumBase === 16) {
        dataCell.innerHTML = '0x';
      } else {
        dataCell.innerHTML = '0';
      }
    } else {
      const Th = document.getElementById(`${id}-th`);
      const Td = document.getElementById(`${id}-td`);
      Th.remove();
      Td.remove();
    }
  };

  debugSelector.addEventListener('change', (event) => {
    const val = parseInt(event.target.value, 10);
    if (val === 1) {
      registerDebugTable.classList.remove('hidden');
      debugExtras.classList.remove('hidden');
      emulator.setDebugCallback((state, numBase) => {
        for (let i = 0; i < 15; i += 1) {
          registerTableData[i].innerHTML = `${registerTableData[i].innerHTML}${state.v[i].toString(numBase)}`;
        }
        const sp = document.getElementById('sp-td');
        if (sp) {
          sp.innerHTML = `${sp.innerHTML}${state.stackPointer.toString(numBase)}`;
        }

        const pc = document.getElementById('pc-td');
        if (pc) {
          pc.innerHTML = `${pc.innerHTML}${state.programCounter.toString(numBase)}`;
        }

        const MemAddr = document.getElementById('i-td');
        if (sp) {
          MemAddr.innerHTML = `${MemAddr.innerHTML}${state.i.toString(numBase)}`;
        }
      });
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
    if (numBase === 10) {
      for (let i = 0; i < registerTableData.length; i += 1) {
        registerTableData[i].innerHTML = '0';
      }
    } else if (numBase === 16) {
      for (let i = 0; i < registerTableData.length; i += 1) {
        registerTableData[i].innerHTML = '0x';
      }
    }
    emulator.setDebugNumBase(numBase);
  });

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
