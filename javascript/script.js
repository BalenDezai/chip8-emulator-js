(async function () {
  const emulator = new window.Chip8Wrapper();
  const canvas = document.querySelector('canvas');
  emulator.chip8.screen.applyCanvas(canvas.getContext('2d'));
  await emulator.loadROMNames();

  const romSelector = document.getElementById('rom_selection');
  for (let i = 0, romsCount = emulator.ROMS.length; i < romsCount; i += 1) {
    const option = document.createElement('option');
    const rom = emulator.ROMS[i];
    option.value = option.innerHTML = rom;
    romSelector.appendChild(option);
  }
  romSelector.addEventListener('change', (event) => {
    if (event.target.value !== '') {
      emulator.loadROM(event.target.value);
      canvas.focus();
    }
  }, false);
}());
