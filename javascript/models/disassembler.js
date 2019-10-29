(function () {
  class Disassembler {
    constructor(chip) {
      this.chip = chip;
    }

    disassemble(instruction) {
      switch (instruction.getCatagory()) {
        case 0x0:
          const subCat = instruction.getSubCatagory();
          switch (subCat) {
            case 0xE0: return ['00E0', 'Display', 'Clear screen'];
            case 0xEE: return ['00EE', 'Flow', 'Returns from subroutine'];
          }
        case 0x1: return ['1NNN', 'FLow', `Jumps to address 0x${instruction.getAddr().toString(16)}` ];
        case 0x2: return ['2NNN', 'Flow', `Calls subroutine at 0x${instruction.getAddr().toString(16)}`];
        default: break;
      }
    }
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Disassembler;
  } else {
    window.EmuDisasembler = Disassembler;
  }
}());
