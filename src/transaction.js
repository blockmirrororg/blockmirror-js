
const Encode = require("./encode");
const sha256 = require("js-sha256");
const secp256k1 = require("secp256k1");
/**
 * 构造各种交易
 */
module.exports = class TransactionGenerator {
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
      case 1: // BPJion
      case 2: // BPLeave
        Encode.unhex(buffer, trx.script.value.bp);
        break;
      case 3: // NewFormat
        Encode.encString(buffer, trx.script.value.name);
        Encode.encString(buffer, trx.script.value.desc);
        Encode.vector(buffer, trx.script.value.dataFormat);
        Encode.vector(buffer, trx.script.value.validScript);
        Encode.vector(buffer, trx.script.value.resultScript);
        break;
      case 4: // NewDataType
        Encode.encString(buffer, trx.script.value.format);
        Encode.encString(buffer, trx.script.value.name);
        Encode.encString(buffer, trx.script.value.desc);
        break;
      // FIXME: 实现其他的类型
      default:
        throw new Error("bad script type");
    }

    const key = Buffer.from(signer, "hex");

    if (key.length !== 32) throw new Error("bad private key");

    const hash = sha256.create();
    hash.update(buffer);

    // FIXME: 这个库用的签名算法不一致 以后改
    const signature = secp256k1.sign(
      Buffer.from(hash.array()),
      Buffer.from(key),
    );

    trx.signatures.push({
      signer: secp256k1
        .publicKeyCreate(key)
        .toString("hex")
        .toUpperCase(),
      signature: signature.toString("hex").toUpperCase(),
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

  /**
   * 创建加入BP的交易
   * @param {String[]} signers 发起的BP私钥
   * @param {String} bp 要加入的BP
   * @param {Integer} expire 过期高度
   * @param {Integer} nonce 随机数
   * @return {Object} 交易
   */
  createBPJoin(
    signers,
    bp,
    expire,
    nonce = Math.floor(Math.random() * 0x100000000),
  ) {
    const trx = {
      expire,
      nonce,
      script: {
        type: 1,
        value: {
          bp,
        },
      },
      signatures: [],
    };

    signers.forEach((o) => this.addSignature(trx, o));
    return trx;
  }

  /**
   * 创建剔除BP交易
   * @param {String[]} signers 发起的BP私钥
   * @param {String} bp 要离开的BP
   * @param {Integer} expire 过期高度
   * @param {Integer} nonce 随机数
   * @return {Object} 交易
   */
  createBPLeave(
    signers,
    bp,
    expire,
    nonce = Math.floor(Math.random() * 0x100000000),
  ) {
    const trx = {
      expire,
      nonce,
      script: {
        type: 2,
        value: {
          bp,
        },
      },
      signatures: [],
    };
    signers.forEach((o) => this.addSignature(trx, o));
    return trx;
  }

  /**
   * 添加数据格式交易
   * @param {String[]} signers 发起的BP私钥
   * @param {Object} type 数据类型
   * @param {Integer} expire 过期高度
   * @param {Integer} nonce 随机数
   * @return {Object} 交易
   */
  createNewFormat(
    signers,
    type,
    expire,
    nonce = Math.floor(Math.random() * 0x100000000),
  ) {
    const trx = {
      expire,
      nonce,
      script: {
        type: 3,
        value: type,
      },
      signatures: [],
    };
    signers.forEach((o) => this.addSignature(trx, o));
    return trx;
  }

  /**
   * 创建数据类型交易
   * @param {String[]} signers 发起的BP私钥
   * @param {Object} formater 格式对象
   * @param {Integer} expire 过期时间
   * @param {Integer} nonce 随机数
   * @return {Object} 交易
   */
  createNewDataType(
    signers,
    formater,
    expire,
    nonce = Math.floor(Math.random() * 0x100000000),
  ) {
    const trx = {
      expire,
      nonce,
      script: {
        type: 4,
        value: formater,
      },
      signatures: [],
    };
    signers.forEach((o) => this.addSignature(trx, o));
    return trx;
  }
}