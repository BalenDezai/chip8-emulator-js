(function () {
  const EmuDisasembler = function (instruction) {
    switch (instruction.getInstrunctionCode()) {
      case 0x00E0: return `|| ${instruction.getInstrunctionCode()} || CLS || Clear Screen ||`;
      case 0x00EE: return `|| ${instruction.getInstrunctionCode()} || RET || Sets ProgramCounter:||`;
      default: break;
    }
  };
}());
