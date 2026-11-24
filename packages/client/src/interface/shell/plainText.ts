import type { Client } from "stoat.js";

/**
 * Readable one-line preview of message content: mentions become names,
 * markdown markers are dropped
 * @param content Raw message content
 * @param client Client (to resolve users and channels)
 */
export function plainText(content: string, client: Client) {
  return content
    .replace(/<@([0-9A-Z]{26})>/g, (_, id) => {
      const user = client.users.get(id);
      return `@${user?.displayName ?? "usuário"}`;
    })
    .replace(/<#([0-9A-Z]{26})>/g, (_, id) => {
      const channel = client.channels.get(id);
      return `#${channel?.name ?? "canal"}`;
    })
    .replace(/<%([0-9A-Z]{26})>/g, "@cargo")
    .replace(/:([0-9A-Z]{26}):/g, ":emoji:")
    .replace(/(\*\*|__|~~|\|\||`{1,3})/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
