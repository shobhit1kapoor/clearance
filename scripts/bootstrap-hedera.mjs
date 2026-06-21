import { readFile, writeFile } from "node:fs/promises";
import {
  AccountCreateTransaction,
  AccountBalanceQuery,
  Client,
  Hbar,
  PrivateKey,
  TopicCreateTransaction
} from "@hiero-ledger/sdk";

const accountId = process.env.HEDERA_OPERATOR_ID;
const privateKeyText = process.env.HEDERA_OPERATOR_PRIVATE_KEY;
if (!accountId || !privateKeyText) throw new Error("HEDERA_OPERATOR_ID and HEDERA_OPERATOR_PRIVATE_KEY are required");

const privateKey = PrivateKey.fromString(privateKeyText);
const client = Client.forTestnet().setOperator(accountId, privateKey);

async function createVendor() {
  const tx = await new AccountCreateTransaction()
    .setKey(privateKey.publicKey)
    .setInitialBalance(new Hbar(10))
    .setAccountMemo("Clearance SecureScan Labs testnet vendor")
    .execute(client);
  const receipt = await tx.getReceipt(client);
  if (!receipt.accountId) throw new Error("Vendor account creation returned no account ID");
  return receipt.accountId.toString();
}

async function createAuditTopic() {
  const tx = await new TopicCreateTransaction()
    .setTopicMemo("clearance-audit-v1")
    .setAdminKey(privateKey.publicKey)
    .setSubmitKey(privateKey.publicKey)
    .execute(client);
  const receipt = await tx.getReceipt(client);
  if (!receipt.topicId) throw new Error("Topic creation returned no topic ID");
  return receipt.topicId.toString();
}

function setEnv(text, key, value) {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  return pattern.test(text) ? text.replace(pattern, `${key}=${value}`) : `${text.trimEnd()}\n${key}=${value}\n`;
}

try {
  const balance = await new AccountBalanceQuery().setAccountId(accountId).execute(client);
  console.log(`Treasury ${accountId} balance: ${balance.hbars.toString()}`);
  const vendorId = process.env.HEDERA_VENDOR_ACCOUNT_ID || await createVendor();
  const topicId = process.env.HEDERA_HCS_TOPIC_ID || await createAuditTopic();
  let env = await readFile(".env.local", "utf8");
  env = setEnv(env, "HEDERA_VENDOR_ACCOUNT_ID", vendorId);
  env = setEnv(env, "HEDERA_HCS_TOPIC_ID", topicId);
  await writeFile(".env.local", env, "utf8");
  console.log(`Vendor account: ${vendorId}`);
  console.log(`HCS audit topic: ${topicId}`);
  console.log("Updated .env.local");
} finally {
  client.close();
}
