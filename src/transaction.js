const Encode = require("./encode");
const secp256k1 = require("secp256k1");
const sha256 = require("js-sha256");
/**
 * 构造各种交易
 */
class TransactionGenerator {
  /**
   *
   * @param {Object} trx 交易
   * @param {String} signer 签名者的私钥
   */
  addSignature(trx, signer) {
    const buffer = [];
    // uint64_t expire;
    Encode.encodeUInt(buffer, trx.expire);
    // uint32_t nonce;
    if (trx.nonce > 0xffffffff) throw new Error("bad nonce");
    Encode.encodeUInt(buffer, trx.nonce);
    // Script script; 暂时只有四种类型
    Encode.encodeUInt(buffer, trx.script.type);
    switch (trx.script.type) {
      case 0: // Transfer
        Encode.unhex(buffer, trx.script.value.target);
        Encode.encodeUInt(buffer, trx.script.value.amount);
        break;
      // FIXME: 实现其他的类型
      default:
        throw new Error("bad script type");
    }
    const key = [];
    Encode.unhex(key, signer);

    if (key.length !== 32) throw new Error("bad private key");

    const hash = sha256.create();
    hash.update(buffer);

    // FIXME: 这个库用的签名算法不一致 以后改
    const sig = secp256k1.sign(new Uint8Array(hash.array()), new Uint8Array(key));

    const signature = secp256k1.signatureNormalize(sig.signature);

    trx.signatures.push({
      signer: secp256k1.publicKeyCreate(new Uint8Array(key)).toString("hex"),
      signature: Encode.hex(signature),
    });
  }
  /**
   * 创建转账交易
   * @param {String} signer 发送者，也是签名者的私钥
   * @param {String} target 接收者
   * @param {Integer} amount 数量
   * @param {Integer} expire 过期高度
   * @param {Integer} nonce 随机数
   * @return {Object} 交易
   */
  createTransfer(
    signer,
    target,
    amount,
    expire,
    nonce = Math.floor(Math.random() * 0x100000000),
  ) {
    const trx = {
      expire,
      nonce,
      script: {
        type: 0,
        value: {
          target,
          amount,
        },
      },
      signatures: [],
    };
    this.addSignature(trx, signer);
    return trx;
  }
}

const Generator = new TransactionGenerator();

console.log(
  Generator.createTransfer(
    "32CD6A9C3B4D58C06606513A7C630307C3E08A42599C54BDB17D5C81EC847B9E",
    "0213E21D6D3A4D64994E938F51A128861DEA7395A456C08F62A4549DF904D4B525",
    1000000,
    2,
    0,
  ),
);
