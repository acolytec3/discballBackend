import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { queryFauna } from "./helpers/fauna.ts";
import { getFloorPrice } from "./helpers/getFloorPrice.ts";
import {
  allSubscriptionsQuery,
  updateSubscriptionsQuery,
} from "./helpers/queries.ts";
import { Subscription } from "./helpers/types.ts";

const token = Deno.env.get("DISCORD_TOKEN");
const webhook = Deno.env.get("WEBHOOK_URL");
export const subscription = async (req: Request): Promise<Response> => {
  const query = allSubscriptionsQuery();
  const res = await queryFauna(query, {});

  for (const subs of res.data.allNotifications.data) {
    const notifications: Subscription[] = [];
    const subsToKeep: Subscription[] = [];
    for (const sub of subs.notice) {
      const fp = parseFloat(await getFloorPrice(sub.collection, sub.chain));
      if (sub.direction === "above") {
        if (fp > parseFloat(sub.price)) {
          notifications.push({
            collection: sub.collection,
            direction: "above",
            price: fp,
            chain: sub.chain,
          });
        } else {
          subsToKeep.push(sub);
        }
      } else {
        if (fp < parseFloat(sub.price)) {
          notifications.push({
            collection: sub.collection,
            direction: "below",
            price: fp,
            chain: sub.chain,
          });
        } else {
          subsToKeep.push(sub);
        }
      }
    }

    // Remove any subscriptions where floor price criteria is met from DB
    if (notifications.length > 0) {
      const query = updateSubscriptionsQuery(
        subs._id,
        subs.userName,
        subsToKeep
      );
      await queryFauna(query, {});
    }

    const res = await fetch("https://discord.com/api/users/@me/channels", {
      body: JSON.stringify({ recipient_id: subs.userName }),
      method: "POST",
      headers: {
        authorization: `Bot ${token}`,
        "content-type": "application/json",
      },
    });

    const id = await res.json();
    const embedFields = notifications.map((notification) => {
      return {
        name: notification.collection,
        value: `${notification.price} ${notification.chain.toUpperCase()}`,
      };
    });
    await fetch(`https://discord.com/api/channels/${id.id}/messages`, {
      method: "POST",
      headers: {
        authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [
          {
            title: "Your Floor Price Alerts",
            fields: embedFields,
          },
        ],
      }),
    });
  }
  return new Response(undefined, { statusText: "We okay", status: 200 });
};
