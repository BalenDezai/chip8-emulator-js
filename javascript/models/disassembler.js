export default function disassemble(instruction) {
  switch (instruction.getCatagory()) {
    case 0x0:
      switch (instruction.getSubCatagory()) {
        case 0xE0: return ['00E0', 'Display', 'Clear screen'];
        case 0xEE: return ['00EE', 'Flow', 'Returns from subroutine'];
        default: break;
      }
      break;
    case 0x1: return ['1NNN', 'FLow', `Jumps to address 0x${instruction.getAddr().toString(16)}`];
    case 0x2: return ['2NNN', 'Flow', `Calls subroutine at 0x${instruction.getAddr().toString(16)}`];
    case 0x3: return ['3XNN', 'Cond', `Skips next instruction if V[0x${instruction.getX().toString(16)}] == 0x${instruction.getKK().toString(16)}`];
    case 0x4: return ['4XNN', 'Cond', `skips next instruction if V[0x${instruction.getX().toString(16)}] != 0x${instruction.getKK().toString(16)}`];
    case 0x5: return ['5XY0', 'Cond', `Skips next instruction if V[0x${instruction.getX().toString(16)}] == V[0x${instruction.getY().toString(16)}]`];
    case 0x6: return ['6XNN', 'Const', `Sets V[0x${instruction.getX().toString(16)}] = 0x${instruction.getKK().toString(16)}`];
    case 0x7: return ['7XNN', 'Const', `Adds v[0x${instruction.getX().toString(16)}] += 0x${instruction.getKK().toString(16)}`];
    case 0x8:
      switch (instruction.getSubCatagory()) {
        case 0x0: return ['8XY0', 'Assign', `Assign V[0x${instruction.getX().toString(16)}] = V[0x${instruction.getY().toString(16)}]`];
        case 0x1: return ['8XY1', 'BitOp', `Assigns V[0x${instruction.getX().toString(16)}] |= V[0x${instruction.getY().toString(16)}]`];
        case 0x2: return ['8XY2', 'BitOp', `Assigns V[0x${instruction.getX().toString(16)}] &= v[0x${instruction.getY().toString(16)}]`];
        case 0x3: return ['8XY3', 'BitOp', `Assigns V[0x${instruction.getX().toString(16)}] ^= v[0x${instruction.getY().toString(16)}]`];
        case 0x4: return ['8XY4', 'Math', `Adds V[0x${instruction.getX().toString(16)}] += V[0x${instruction.getX().toString(16)}]`];
        case 0x5: return ['8XY5', 'Math', `Subtracts v[0x${instruction.getX().toString(16)}] -= v[0x${instruction.getY().toString(16)}]`];
        case 0x6: return ['8XY6', 'BitOp', `Shift v[0x${instruction.getX().toString(16)}] >> 1. Set v[${15}] = v[0x${instruction.getX().toString(16)}] & 1`];
        case 0x7: return ['8XY7', 'Math', `v[0x${instruction.getX().toString(16)}] = v[0x${instruction.getY().toString(16)}] - v[0x${instruction.getX().toString(16)}]`];
        case 0xE: return ['8XYE', 'BitOp', `Shift v[0x${instruction.getX().toString(16)}] << 1. Set v[${15}] = v[0x0${instruction.getX().toString(16)}] & 1`];
        default: break;
      }
      break;
    case 0x9: return ['9XY0', 'Cond', `Skips next instruction if v[0x${instruction.getX().toString(16)}] != v[0x${instruction.getY().toString(16)}]`];
    case 0xA: return ['ANNN', 'MEM', `Sets I to address 0x${instruction.getAddr().toString(16)}`];
    case 0xB: return ['BNNN', 'Flow', `Jumps to address 0x${instruction.getAddr().toString(16)} + v[0x${0}]`];
    case 0xC: return ['CxNN', 'Rand', `Sets v[0x${instruction.getX().toString(16)}] = random(0,255) & 0x${instruction.getKK().toString(16)}`];
    case 0xD:
      return [
        'DXYN',
        'Disp',
        `Draw sprite at (v[0x${instruction.getX().toString(16)}], v[0x${instruction.getY().toString(16)}]) with ${instruction.getSubCatagory().toString(16)} of height and 8 of width from memory location I`];
    case 0xE:
      switch (instruction.getSubCatagory()) {
        case 0x1: return ['EXA1', 'KeyOp', `Skips next instruction if keyPressed() == v[0x${instruction.getX().toString(16)}]`];
        case 0xE: return ['EX9E', 'KeyOp', `Skips next instruction if keyPressed != v[0x${instruction.getX().toString(16)}]`];
        default: break;
      }
      break;
    case 0xf:
      switch (instruction.getKK()) {
        case 0x07: return ['FX07', 'Timer', `Sets v[0x${instruction.getX().toString(16)}] = delay_timer`];
        case 0x0A: return ['FX0A', 'KeyOp', `Sets v[0x${instruction.getX().toString(16)}] = KeyPressed()`];
        case 0x15: return ['FX15', 'Timer', `Sets delay_timer = v[0x${instruction.getX().toString(16)}]`];
        case 0x18: return ['FX18', 'Sound', `Sets sound_timer = v[0x${instruction.getX().toString(16)}]`];
        case 0x1E: return ['FX1E', 'MEM', `Adds I += v[0x${instruction.getX().toString(16)}]`];
        case 0x29: return ['FX29', 'MEM', `Sets I = v[0x${instruction.getX().toString(16)}] * 5`];
        case 0x33: return ['FX33', 'BCD', `Sets I, I+1, I+2 to v[0x${instruction.getX().toString(16)}]`];
        case 0x55: return ['FX55', 'BCD', `Empties all registers from v[0x0] to v[0x${instruction.getX().toString(16)}]`];
        case 0x65: return ['FX65', 'BCD', `Sets all registers from v[0x0] to v[0x${instruction.getX().toString(16)}]`];
        default: break;
      }
      break;
    default: break;
  }
}
// export default class Disassembler {
//   constructor() {
//     this.disassemble = (instruction) => {
//       switch (instruction.getCatagory()) {
//         case 0x0:
//           switch (instruction.getSubCatagory()) {
//             case 0xE0: return ['00E0', 'Display', 'Clear screen'];
//             case 0xEE: return ['00EE', 'Flow', 'Returns from subroutine'];
//             default: break;
//           }
//           break;
//         case 0x1: return ['1NNN', 'FLow', `Jumps to address 0x${instruction.getAddr().toString(16)}`];
//         case 0x2: return ['2NNN', 'Flow', `Calls subroutine at 0x${instruction.getAddr().toString(16)}`];
//         case 0x3: return ['3XNN', 'Cond', `Skips next instruction if V[0x${instruction.getX().toString(16)}] == 0x${instruction.getKK().toString(16)}`];
//         case 0x4: return ['4XNN', 'Cond', `skips next instruction if V[0x${instruction.getX().toString(16)}] != 0x${instruction.getKK().toString(16)}`];
//         case 0x5: return ['5XY0', 'Cond', `Skips next instruction if V[0x${instruction.getX().toString(16)}] == V[0x${instruction.getY().toString(16)}]`];
//         case 0x6: return ['6XNN', 'Const', `Sets V[0x${instruction.getX().toString(16)}] = 0x${instruction.getKK().toString(16)}`];
//         case 0x7: return ['7XNN', 'Const', `Adds v[0x${instruction.getX().toString(16)}] += 0x${instruction.getKK().toString(16)}`];
//         case 0x8:
//           switch (instruction.getSubCatagory()) {
//             case 0x0: return ['8XY0', 'Assign', `Assign V[0x${instruction.getX().toString(16)}] = V[0x${instruction.getY().toString(16)}]`];
//             case 0x1: return ['8XY1', 'BitOp', `Assigns V[0x${instruction.getX().toString(16)}] |= V[0x${instruction.getY().toString(16)}]`];
//             case 0x2: return ['8XY2', 'BitOp', `Assigns V[0x${instruction.getX().toString(16)}] &= v[0x${instruction.getY().toString(16)}]`];
//             case 0x3: return ['8XY3', 'BitOp', `Assigns V[0x${instruction.getX().toString(16)}] ^= v[0x${instruction.getY().toString(16)}]`];
//             case 0x4: return ['8XY4', 'Math', `Adds V[0x${instruction.getX().toString(16)}] += V[0x${instruction.getX().toString(16)}]`];
//             case 0x5: return ['8XY5', 'Math', `Subtracts v[0x${instruction.getX().toString(16)}] -= v[0x${instruction.getY().toString(16)}]`];
//             case 0x6: return ['8XY6', 'BitOp', `Shift v[0x${instruction.getX().toString(16)}] >> 1. Set v[${15}] = v[0x${instruction.getX().toString(16)}] & 1`];
//             case 0x7: return ['8XY7', 'Math', `v[0x${instruction.getX().toString(16)}] = v[0x${instruction.getY().toString(16)}] - v[0x${instruction.getX().toString(16)}]`];
//             case 0xE: return ['8XYE', 'BitOp', `Shift v[0x${instruction.getX().toString(16)}] << 1. Set v[${15}] = v[0x0${instruction.getX().toString(16)}] & 1`];
//             default: break;
//           }
//           break;
//         case 0x9: return ['9XY0', 'Cond', `Skips next instruction if v[0x${instruction.getX().toString(16)}] != v[0x${instruction.getY().toString(16)}]`];
//         case 0xA: return ['ANNN', 'MEM', `Sets I to address 0x${instruction.getAddr().toString(16)}`];
//         case 0xB: return ['BNNN', 'Flow', `Jumps to address 0x${instruction.getAddr().toString(16)} + v[0x${0}]`];
//         case 0xC: return ['CxNN', 'Rand', `Sets v[0x${instruction.getX().toString(16)}] = random(0,255) & 0x${instruction.getKK().toString(16)}`];
//         case 0xD:
//           return [
//             'DXYN',
//             'Disp',
//             `Draw sprite at (v[0x${instruction.getX().toString(16)}], v[0x${instruction.getY().toString(16)}]) with ${instruction.getSubCatagory().toString(16)} of height and 8 of width from memory location I`];
//         case 0xE:
//           switch (instruction.getSubCatagory()) {
//             case 0x1: return ['EXA1', 'KeyOp', `Skips next instruction if keyPressed() == v[0x${instruction.getX().toString(16)}]`];
//             case 0xE: return ['EX9E', 'KeyOp', `Skips next instruction if keyPressed != v[0x${instruction.getX().toString(16)}]`];
//             default: break;
//           }
//           break;
//         case 0xf:
//           switch (instruction.getKK()) {
//             case 0x07: return ['FX07', 'Timer', `Sets v[0x${instruction.getX().toString(16)}] = delay_timer`];
//             case 0x0A: return ['FX0A', 'KeyOp', `Sets v[0x${instruction.getX().toString(16)}] = KeyPressed()`];
//             case 0x15: return ['FX15', 'Timer', `Sets delay_timer = v[0x${instruction.getX().toString(16)}]`];
//             case 0x18: return ['FX18', 'Sound', `Sets sound_timer = v[0x${instruction.getX().toString(16)}]`];
//             case 0x1E: return ['FX1E', 'MEM', `Adds I += v[0x${instruction.getX().toString(16)}]`];
//             case 0x29: return ['FX29', 'MEM', `Sets I = v[0x${instruction.getX().toString(16)}] * 5`];
//             case 0x33: return ['FX33', 'BCD', `Sets I, I+1, I+2 to v[0x${instruction.getX().toString(16)}]`];
//             case 0x55: return ['FX55', 'BCD', `Empties all registers from v[0x0] to v[0x${instruction.getX().toString(16)}]`];
//             case 0x65: return ['FX65', 'BCD', `Sets all registers from v[0x0] to v[0x${instruction.getX().toString(16)}]`];
//             default: break;
//           }
//           break;
//         default: break;
//       }
//     };
//   }

//   async WriteToElement(instruction) {
//     const args = this.disassemble(instruction);
//     if (args) {
//       let str = '';
//       for (let i = 0; i < args.length; i += 1) {
//         str += `|| ${args[i]}`;
//       }
//       this.element.innerHTML += `<div>${str}</div>`;
//     }
//   }
// }
