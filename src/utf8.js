/**
 * UTF8 <==> UTF16(javascript string)
 * Copyright liuyujun@fingera.cn
 * https://en.wikipedia.org/wiki/UTF-8
 * https://en.wikipedia.org/wiki/UTF-16
 */

/**
 * Encode string to utf8 bytes
 * @example
 * const bytes = encode("js string");
 * @example
 * encode("js string", appendTo);
 * @param {String} str - input js string
 * @param {Array} [bytesArray = []] - pushable bytes array
 * @return {Array} same as second parameter
 */
export function encode(str, bytesArray = []) {
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80) {
      // [U+0000, U+007F]
      bytesArray.push(c);
    } else if (c < 0x800) {
      // [U+0080, U+07FF]
      bytesArray.push((c >> 6) | 0xc0); // 110xxxxx 5
      bytesArray.push((c & 0x3f) | 0x80); // 10xxxxxx 6
    } else {
      if (c >= 0xd800 && c <= 0xdfff) {
        if (c > 0xdbff) {
          throw new Error("invalid utf16 high surrogate");
        }
        // [U+10000 U+10FFFF]
        const second = str.charCodeAt(++i);
        if (isNaN(second) || second < 0xdc00 || second > 0xdfff) {
          throw new Error("invalid utf16 low surrogate");
        }
        const cc = ((c - 0xd7c0) << 10) + (second - 0xdc00);
        bytesArray.push((cc >> 18) | 0xf0); // 11110xxx 3
        bytesArray.push(((cc >> 12) & 0x3f) | 0x80); // 10xxxxxx 6
        bytesArray.push(((cc >> 6) & 0x3f) | 0x80); // 10xxxxxx 6
        bytesArray.push((cc & 0x3f) | 0x80); // 10xxxxxx 6
      } else {
        // [U+0800, U+FFFF]
        bytesArray.push((c >> 12) | 0xe0); // 1110xxxx 4
        bytesArray.push(((c >> 6) & 0x3f) | 0x80); // 10xxxxxx 6
        bytesArray.push((c & 0x3f) | 0x80); // 10xxxxxx 6
      }
    }
  }
  return bytesArray;
}

/**
 * Decode utf8 bytes to string
 * @param {Array} bytes - input bytes array
 * @return {String}
 */
export function decode(bytes) {
  return decodeBuf(
    {
      bytes,
      cursor: 0,
    },
    bytes.length,
  );
}

/**
 * Decode utf8 buffer to string
 * @param {Object} buf
 * @param {Array} buf.bytes - input bytes array
 * @param {Integer} buf.cursor - start and end cursor
 * @param {Integer} limit string limit
 * @return {String}
 */
export function decodeBuf(buf, limit) {
  const codeUnits = [];
  let result = "";
  const { bytes } = buf;
  let { cursor } = buf;
  const { length } = bytes;

  while (result.length + codeUnits.length < limit && cursor < length) {
    const c1 = bytes[cursor++];
    if (c1 < 0x80) {
      // 0xxxxxxx
      codeUnits.push(c1);
    } else if (c1 < 0xc0) {
      // 10xxxxxx
      throw new Error("illegal utf8: invalid continuation mark");
    } else if (c1 < 0xe0) {
      // 110xxxxx
      const c2 = bytes[cursor++];
      if ((c2 & 0xc0) !== 0x80) {
        throw new Error("illegal utf8: invalid continuation mark");
      }
      codeUnits.push((c2 & 0x3f) | ((c1 & 0x1f) << 6));
    } else if (c1 < 0xf0) {
      // 1110xxxx
      const c2 = bytes[cursor++];
      const c3 = bytes[cursor++];
      if ((c2 & 0xc0) !== 0x80 || (c3 & 0xc0) !== 0x80) {
        throw new Error("illegal utf8: invalid continuation mark");
      }
      codeUnits.push(((c1 & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f));
    } else if (c1 < 0xf8) {
      // 11110xxx
      const c2 = bytes[cursor++];
      const c3 = bytes[cursor++];
      const c4 = bytes[cursor++];
      if (
        (c2 & 0xc0) !== 0x80 ||
        (c3 & 0xc0) !== 0x80 ||
        (c4 & 0xc0) !== 0x80
      ) {
        throw new Error("illegal utf8: invalid continuation mark");
      }
      const codepoint =
        (((c1 & 7) << 18) |
          ((c2 & 0x3f) << 12) |
          ((c3 & 0x3f) << 6) |
          (c4 & 0x3f)) -
        0x10000;

      const low = (codepoint & 0x3ff) + 0xdc00;
      const high = ((codepoint >> 10) & 0x3ff) + 0xd800;
      codeUnits.push(high, low);
    } else {
      throw new Error("illegal utf8: more than four bytes");
    }

    if (codeUnits.length >= 8192) {
      result += String.fromCharCode.apply(null, codeUnits);
      codeUnits.length = 0;
    }
  }

  result += String.fromCharCode.apply(null, codeUnits);
  buf.cursor = cursor;
  return result;
}

/**
 * Verify utf8 bytes is valid
 * @param {Array} bytes
 * @return {Boolean}
 */
export function valid(bytes) {
  const { length } = bytes;
  for (let i = 0; i < length; i++) {
    const byte = bytes[i];
    if (byte < 0b10000000) {
      // U+0000 U+007F
      // 0xxxxxxx
    } else if (byte < 0b11000000) {
      // 10xxxxxx is continue mark
      return false;
    } else if (byte < 0b11100000) {
      // U+0080 U+07FF
      // 110xxxxx 10xxxxxx
      if ((bytes[++i] & 0b11000000) !== 0b10000000) return false;
    } else if (byte < 0b11110000) {
      // U+0800 U+FFFF
      // 1110xxxx 10xxxxxx 10xxxxxx
      if ((bytes[++i] & 0b11000000) !== 0b10000000) return false;
      if ((bytes[++i] & 0b11000000) !== 0b10000000) return false;
    } else if (byte < 0b11111000) {
      // U+10000 U+10FFFF
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if ((bytes[++i] & 0b11000000) !== 0b10000000) return false;
      if ((bytes[++i] & 0b11000000) !== 0b10000000) return false;
      if ((bytes[++i] & 0b11000000) !== 0b10000000) return false;
    } else {
      return false; // 2003 UTF-8 is defined one to four bytes
    }
  }
  return true;
}
