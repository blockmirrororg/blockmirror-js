/**
 * 整数压缩编码
 */

/**
 * 编码
 * @param {Array} arr 缓存
 * @param {Integer} value 整数值
 */
export function encode(arr, value) {
  if (value === undefined) {
    value = 0;
  }
  if (
    value != Math.floor(value) ||
    value < 0 ||
    value > 0xffffffff ||
    !Number.isInteger(value)
  ) {
    throw new Error("invalid uint: " + value);
  }
  let low = value >>> 0;
  let high = Math.floor((value - low) / 0x100000000) >>> 0;
  while (high > 0 || low > 127) {
    arr.push((low & 0x7f) | 0x80);
    low = ((low >>> 7) | (high << 25)) >>> 0;
    high = high >>> 7;
  }
  arr.push(low);
}

/**
 * 解码
 * @param {Buffer} bytes 二进制数组可按字节访问
 * @return {Integer}
 */
export function decode(bytes) {
  const { length } = bytes;
  let r = 0;
  let i = 0;
  for (; i < 8; i++) {
    if (length <= i) {
      throw new Error("invalid uint bytes");
    }
    const byte = bytes[i];
    r += Math.floor((byte & 0x7f) * Math.pow(2, i * 7));
    if (byte < 0x80) {
      i++;
      break;
    }
  }
  return r;
}
