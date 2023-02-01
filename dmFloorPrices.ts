import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const token = Deno.env.get("DISCORD_TOKEN");

const res = await fetch("https://discord.com/api/users/@me/channels", {
    body: JSON.stringify({ recipient_id: "403636673914863626"}),
  method: "POST",
  headers: {
    authorization: `Bot ${token}`,
    "content-type": "application/json",
  }
});

const id = await res.json()
console.log(id)
await fetch(`https://discord.com/api/channels/${id.id}/messages`, {
  body: JSON.stringify({ content: "hello from deno"}),
  method: "POST",
  headers: {
    authorization: `Bot ${token}`,
    "content-type": "application/json",
  }
});

