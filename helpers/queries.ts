import { Subscription } from "./types.ts";

export const updateSubscriptionsQuery = (
  id: string,
  userName: string,
  subscriptions: Subscription[]
) => {
  let query = `mutation update {
         updateNotification(id:"${id}", data:{
           userName: "${userName}", notice: ${JSON.stringify(subscriptions)}
         }){
           userName
           notice {
             collection
             price
             chain
             direction
           }
         }
       }`;
  query = query.replace(/\"collection\"/g, "collection");
  query = query.replace(/\"price\"/g, "price");
  query = query.replace(/\"chain\"/g, "chain");
  query = query.replace(/\"direction\"/g, "direction");
  return query;
};

export const allSubscriptionsQuery = () => {
  return `
    query {
     allNotifications {
       data {
         _id
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
};
