import { encode, decode } from "./integer";

/**
 * 入口函数
 * @return {Integer} 函数返回值
 */
async function main() {
  const arr = [];
  encode(arr, 100 + 50);
  console.log(decode(arr));
  console.log(arr);
  return 0;
}

main()
  .then((code) => {
    process.exit(code);
  })
  .catch(console.error);
