/** One dispatched server-sent event. */
export interface SseMessage {
  /** Event name; `message` when the stream did not set one. */
  event: string;
  data: string;
  /** Last event ID in effect when the message was dispatched. */
  id?: string;
  /** Reconnection delay requested by the server, in milliseconds. */
  retry?: number;
}

/**
 * Parse a text/event-stream into messages, following the WHATWG event-stream rules
 * (CR, LF and CRLF line endings; comments; multi-line data; `id` and `retry` fields).
 */
export async function* parseSse(chunks: AsyncIterable<string>): AsyncGenerator<SseMessage> {
  let buffer = "";
  let first = true;
  let event = "";
  let data: string[] = [];
  let hasData = false;
  let lastId: string | undefined;
  let retry: number | undefined;

  function* processLine(line: string): Generator<SseMessage> {
    if (line === "") {
      if (hasData) {
        const message: SseMessage = { event: event || "message", data: data.join("\n") };
        if (lastId !== undefined) message.id = lastId;
        if (retry !== undefined) message.retry = retry;
        yield message;
      }
      event = "";
      data = [];
      hasData = false;
      retry = undefined;
      return;
    }
    if (line.startsWith(":")) return;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    switch (field) {
      case "event":
        event = value;
        break;
      case "data":
        data.push(value);
        hasData = true;
        break;
      case "id":
        if (!value.includes("\0")) lastId = value;
        break;
      case "retry":
        if (/^\d+$/.test(value)) retry = Number(value);
        break;
    }
  }

  for await (const chunk of chunks) {
    buffer += chunk;
    if (first && buffer.length > 0) {
      if (buffer.charCodeAt(0) === 0xfeff) buffer = buffer.slice(1);
      first = false;
    }
    let start = 0;
    for (let i = 0; i < buffer.length; i++) {
      const ch = buffer[i];
      if (ch !== "\n" && ch !== "\r") continue;
      // A trailing CR may be the first half of a CRLF split across chunks.
      if (ch === "\r" && i === buffer.length - 1) break;
      yield* processLine(buffer.slice(start, i));
      if (ch === "\r" && buffer[i + 1] === "\n") i++;
      start = i + 1;
    }
    buffer = buffer.slice(start);
  }
  // A trailing CR at end of stream terminates the final line; an unterminated line is discarded.
  if (buffer.endsWith("\r")) yield* processLine(buffer.slice(0, -1));
}

/** Decode a byte stream (e.g. `response.body`) into text chunks. */
export async function* decodeText(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) yield decoder.decode(value, { stream: true });
    }
    const tail = decoder.decode();
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}

/** Parse server-sent events from a fetch `Response` whose body is a readable stream. */
export function sseFromResponse(response: Response): AsyncGenerator<SseMessage> {
  if (!response.body) {
    throw new Error(
      "Response body is not streamable. On React Native, pass a streaming fetch (e.g. expo/fetch) to ApiClient.",
    );
  }
  return parseSse(decodeText(response.body));
}
