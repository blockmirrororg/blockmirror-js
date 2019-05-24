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
   * 
   * @param {*} buffer 
   * @param {*} hex 
   */
  vector(buffer, hex) {
    const buf = [];
    this.unhex(buf, hex);

    this.encodeUInt(buffer, buf.length);
    buffer.push(...buf);
  }
  /**
   * HEX编码
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

  /**
   * UTF8解码
   * @param {Array} outbuffer 
   * @param {String} str 
   */
  encString(outbuffer,str){
    if (str === undefined) {
      str = DEFAULT_STRING;
    }
    const buffer = [];
    // this.encodeUInt(buffer, str.length);
    
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
  
      if (c < 0x80) {  // 7 [U+0000, U+007F]
        buffer.push(c);   // 0xxxxxxx 7
      } else if (c < 0x800) {        // 11 [U+0080, U+07FF]
        buffer.push((c >> 6) | 0xC0);   // 110xxxxx 5
        buffer.push((c & 0x3F) | 0x80); // 10xxxxxx 6
      } else if (c < 0x10000) {
        if (c >= 0xD800 && c <= 0xDBFF) {
          i++;
          if (i >= str.length) {
            throw new Error("illegal utf8: L overflow");
          }
          const second = str.charCodeAt(i);
          if (second >= 0xDC00 && second <= 0xDFFF) {
            // 10000->110000 c[40, 440) second[0, 400]
            const cc = ((c - 0xD7C0) << 10) + (second - 0xDC00);
                                                   // 21 [U+10000, U+10FFFF]
            buffer.push((cc >> 18) | 0xF0);           // 11110xxx 3
            buffer.push(((cc >> 12) & 0x3F ) | 0x80); // 10xxxxxx 6
            buffer.push(((cc >> 6) & 0x3F) | 0x80);   // 10xxxxxx 6
            buffer.push((cc & 0x3F) | 0x80);          // 10xxxxxx 6
          } else {
            throw new Error("illegal utf8: invalid L");
          }
        } else {                              // 16 [U+0800, U+FFFF]
          buffer.push((c >> 12) | 0xE0);         // 1110xxxx 4
          buffer.push(((c >> 6) & 0x3F) | 0x80); // 10xxxxxx 6
          buffer.push((c & 0x3F) | 0x80);        // 10xxxxxx 6
        }
      }
    }

    this.encodeUInt(outbuffer, buffer.length);
    outbuffer.push(...buffer);
  }
}

module.exports = new Encode();
