import "https://deno.land/x/dotenv/load.ts";
import { queryFauna } from "./helpers/fauna.ts";
import { getFloorPrice } from "./helpers/getFloorPrice.ts";

const webhook = Deno.env.get("WEBHOOK_URL");
export const subscription = async (req: Request): Promise<Response> => {
  const query = `
   query {
    allNotifications {
      data {
        userName 
        notice {
          collection
          direction
          price
          chain
        }
      }
    }
  }`;
  const res = await queryFauna(query, {});
  console.log(res.data.allNotifications.data);
  const subs = res.data.allNotifications.data[0];
  const notifications: any = [];
  for (const sub of subs.notice) {
    const fp = await getFloorPrice(sub.collection, sub.chain);
    if (sub.direction === "above") {
      if (parseFloat(fp) > parseFloat(sub.price)) {
        notifications.push({
          userName: subs.userName,
          collection: sub.collection,
          direction: "above",
          floorPrice: fp,
        });
      }
    } else {
      if (parseFloat(fp) < parseFloat(sub.price)) {
        notifications.push({
          userName: subs.userName,
          collection: sub.collection,
          direction: "below",
          floorPrice: fp,
        });
      }
    }
  }
  console.log(notifications);

  for (const notification of notifications) {
    await fetch(webhook!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Floor Watcher",
        content: `<@${notification.userName}>, ${notification.collection} is at ${notification.floorPrice}, ${notification.direction} your target`,
      }),
    });
  }
  return new Response(undefined, { statusText: "We okay", status: 200 });
};
