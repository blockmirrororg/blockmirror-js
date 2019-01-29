import { encode, decode, decodeBuf, valid } from "../utf8";

const testcase = [
  // https://en.wikipedia.org/wiki/UTF-8
  { str: "$", arr: [0x24] },
  { str: "¢", arr: [0xc2, 0xa2] },
  { str: "ह", arr: [0xe0, 0xa4, 0xb9] },
  { str: "€", arr: [0xe2, 0x82, 0xac] },
  { str: "𐍈", arr: [0xf0, 0x90, 0x8d, 0x88] },
  {
    str: "$¢ह𐍈",
    arr: [0x24, 0xc2, 0xa2, 0xe0, 0xa4, 0xb9, 0xf0, 0x90, 0x8d, 0x88],
  },
  // website
  { str: "❄", arr: [226, 157, 132] },
  { str: "😁", arr: [240, 159, 152, 129] },
  {
    str: "Hello World!",
    arr: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33],
  },
  {
    str: "特朗普宣布取消赴瑞士达沃斯论坛行程",
    arr: [
      231,
      137,
      185,
      230,
      156,
      151,
      230,
      153,
      174,
      229,
      174,
      163,
      229,
      184,
      131,
      229,
      143,
      150,
      230,
      182,
      136,
      232,
      181,
      180,
      231,
      145,
      158,
      229,
      163,
      171,
      232,
      190,
      190,
      230,
      178,
      131,
      230,
      150,
      175,
      232,
      174,
      186,
      229,
      157,
      155,
      232,
      161,
      140,
      231,
      168,
      139,
    ],
  },
];

const invalidString = [
  "\uD800", // overflow
  "\uD800\uD800", // invalid low
  "\uDC00", // invalid high
];

const invalidUtf8Bytes = [
  [0x80], // invalid continue mark
  [0xc0, 0xc0], // invalid continue mark
  [0xe0, 0xc0], // invalid continue mark
  [0xe0, 0x80, 0xc0], // invalid continue mark
  [0xf0, 0xc0], // invalid continue mark
  [0xf0, 0x80, 0xc0], // invalid continue mark
  [0xf0, 0x80, 0x80, 0xc0], // invalid continue mark
  [0xf8], // five bytes
  [0xf0], // overflow
];

let largeStr = "";
const largeBytes = [];
for (let i = 0; i < 8192 * 2; i++) {
  largeBytes.push(0x24);
  largeStr += "$";
}

describe("utf8", () => {
  test("encode", () => {
    for (const { str, arr } of testcase) {
      expect(encode(str)).toEqual(arr);
    }
    for (const str of invalidString) {
      expect(encode.bind(null, str)).toThrowError(Error);
    }
    expect(encode(largeStr)).toEqual(largeBytes);
  });
  test("decode", () => {
    for (const { str, arr } of testcase) {
      expect(decode(arr)).toEqual(str);
    }
    for (const arr of invalidUtf8Bytes) {
      expect(decode.bind(null, arr)).toThrowError(Error);
    }
    expect(decode(largeBytes)).toEqual(largeStr);
  });
  test("decodeBuf", () => {
    for (const { str, arr } of testcase) {
      const buf = {
        bytes: arr,
        cursor: 0,
      };
      expect(decodeBuf(buf, arr.length)).toEqual(str);
      expect(buf.cursor).toBe(arr.length);
    }
    const buf = {
      bytes: largeBytes,
      cursor: 0,
    };
    expect(decodeBuf(buf, largeBytes.length)).toEqual(largeStr);
    expect(buf.cursor).toBe(largeBytes.length);
  });
  test("valid", () => {
    for (const { arr } of testcase) {
      expect(valid(arr)).toBeTruthy();
    }
    for (const arr of invalidUtf8Bytes) {
      expect(valid(arr)).toBeFalsy();
    }
  });
});
