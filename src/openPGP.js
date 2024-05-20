const openpgp = require("openpgp");

/**
 * Allow streaming unauthenticated data before its integrity has been checked. This would allow the application to
 * process very large streams by deferring the checksum integrity check to be only verified at the end of the stream.
 *
 * This setting is **insecure** if the partially decrypted message is processed further or displayed to the user.
 *
 * Therefore, the client application is advised to implement at least one of the following strategies when processing
 * very large streams.
 * - Perform a two-phase commit -- process the data in a staged area, and when the stream finalizes, commit if no error
 *   occurs.
 * - Read the stream twice -- read the contents to the end of the stream, and if the data is verified to be correct,
 *   then perform a second pass on the stream to perform the real work.
 * @memberof module:config
 * @property {Boolean} allowUnauthenticatedStream
 */
openpgp.config.allowUnauthenticatedStream = true;

const readKey = async (secretValue) =>
  await openpgp.readKey({ armoredKey: secretValue.armoredKey });

const encrypt = async (plaintext, encryptionKey) =>
  await openpgp.encrypt({
    message: await openpgp.createMessage({ text: plaintext }),
    encryptionKeys: encryptionKey,
    // format: "binary",
  });

const decryptionKey = async (secretValue) =>
  await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({
      armoredKey: secretValue.armoredKey,
    }),
    passphrase: secretValue.passphrase
  });

const decryptedResponse = async (binaryMessage, decryptionKey) =>
  await openpgp.decrypt({
    // message: await openpgp.readMessage({ binaryMessage : objectStream.Body }),
    message: await openpgp.readMessage({ armoredMessage: binaryMessage }),
    decryptionKeys: decryptionKey,
  });

module.exports = {
  readKey,
  encrypt,
  decryptionKey,
  decryptedResponse,
};
