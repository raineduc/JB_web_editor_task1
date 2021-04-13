

/**
 * @param {ReadableStream} stream
 * @returns {Promise}
 */
export const readTextFromStream = async (stream) => {
  const reader = stream.getReader();
  const textDecoder = new TextDecoder();

  let length = 0;
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    length += value.length;
  }

  const byteArray = new Uint8Array(length);
  let position = 0;

  for (let chunk of chunks) {
    byteArray.set(chunk, position);
    position += chunk.length;
  }

  console.log("done");

  return String(new TextDecoder().decode(byteArray));
}