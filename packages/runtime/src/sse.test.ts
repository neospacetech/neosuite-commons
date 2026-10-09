import { describe, expect, it } from "vitest";
import { ApiClient, parseSse, type SseMessage } from "./index";

async function* from(chunks: string[]): AsyncGenerator<string> {
  for (const chunk of chunks) yield chunk;
}

async function collect(iter: AsyncIterable<SseMessage>): Promise<SseMessage[]> {
  const out: SseMessage[] = [];
  for await (const message of iter) out.push(message);
  return out;
}

const SAMPLE = [
  ": keep-alive\n",
  "retry: 3000\n",
  "event: token\n",
  "id: 1\n",
  "data: Hel",
  "lo\n\n",
  "event: token\r\nid: 2\r\ndata: line one\r\ndata:line two\r\n\r\n",
  "data: {\"done\":true}\r",
  "\n\r\n",
  "data: unterminated",
];

describe("parseSse", () => {
  it("parses a sample stream split at arbitrary points", async () => {
    expect(await collect(parseSse(from(SAMPLE)))).toEqual([
      { event: "token", data: "Hello", id: "1", retry: 3000 },
      { event: "token", data: "line one\nline two", id: "2" },
      { event: "message", data: '{"done":true}', id: "2" },
    ]);
  });

  it("gives the same result one character at a time", async () => {
    const chars = [...SAMPLE.join("")];
    expect(await collect(parseSse(from(chars)))).toEqual(await collect(parseSse(from(SAMPLE))));
  });

  it("skips events without data, strips a BOM and ignores unknown fields", async () => {
    const stream = from(["﻿event: ping\n\n", "foo: bar\ndata\n\n", "data:  two spaces\n\n"]);
    expect(await collect(parseSse(stream))).toEqual([
      { event: "message", data: "" },
      { event: "message", data: " two spaces" },
    ]);
  });

  it("streams from ApiClient.stream", async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode("event: delta\ndata: a\n\n"));
        controller.enqueue(encoder.encode("event: delta\ndata: b\n\n"));
        controller.close();
      },
    });
    const client = new ApiClient({
      baseUrl: "https://suite.test",
      fetch: async () => new Response(body, { status: 200, headers: { "Content-Type": "text/event-stream" } }),
    });
    const messages = await collect(client.stream("/chat", { body: { prompt: "hi" } }));
    expect(messages.map((m) => m.data)).toEqual(["a", "b"]);
  });
});
