/**
 * 转换
 * @param {Integer} c 字符
 * @return {Integer} 值
 */
function hexValue(c) {
  switch (c) {
    case 0x30:
    case 0x31:
    case 0x32:
    case 0x33:
    case 0x34:
    case 0x35:
    case 0x36:
    case 0x37:
    case 0x38:
    case 0x39:
      return c - 0x30;
    case 0x61:
    case 0x62:
    case 0x63:
    case 0x64:
    case 0x65:
    case 0x66:
      return c - 0x61 + 10;
    case 0x41:
    case 0x42:
    case 0x43:
    case 0x44:
    case 0x45:
    case 0x46:
      return c - 0x41 + 10;
    default:
      throw new Error("bad hex char " + c);
      break;
  }
}

const hexStr = "0123456789ABCDEF";
/**
 * 编码器
 */
class Encode {
  /**
   * 解码HEX编码的东西
   * @param {Array} buffer
   * @param {String} str
   */
  unhex(buffer, str) {
    if (str.length % 2 !== 0) throw new Error("bad hex length");
    for (let i = 0; i < str.length; i += 2) {
      const c1 = hexValue(str.charCodeAt(i));
      const c2 = hexValue(str.charCodeAt(i + 1));
      buffer.push((c1 << 4) | c2);
    }
  }
  /**
   * HEX解码
   * @param {Array} buffer 
   * @return {String}
   */
  hex(buffer) {
    let str = "";
    for (let i = 0; i < buffer.length; i++) {
      const b = buffer[i];
      str += hexStr[b >> 4];
      str += hexStr[b & 0xF];
    }
    return str;
  }
  /**
   * 编码无符号整数
   * @param {Array} buffer
   * @param {Integer} value
   */
  encodeUInt(buffer, value) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error("bad UInt");
    }
    let low = value >>> 0;
    let high = Math.floor((value - low) / 0x100000000) >>> 0;
    while (high > 0 || low > 127) {
      buffer.push((low & 0x7f) | 0x80);
      low = ((low >>> 7) | (high << 25)) >>> 0;
      high = high >>> 7;
    }
    buffer.push(low);
  }
}

module.exports = new Encode();
