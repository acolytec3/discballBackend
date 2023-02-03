import { formatDomain } from "./util.ts";

const reservoirToken = Deno.env.get("RESERVOIR_SECRET");
const hyperspaceToken = Deno.env.get("HYPERSPACE_API_KEY");
const reservoirURL = "https://api.reservoir.tools/collections/v5";
const hyperspaceRestUrl = "https://beta.api.solanalysis.com/rest";
export const getFloorPrice = async (
  collection: string,
  chain: string
): Promise<{ fp: string, content: string}> => {
  try {
  switch (chain) {
    case "eth": {
      const options: any = {
        method: "GET",
        headers: { accept: "*/*", "x-api-key": reservoirToken },
      };
      const res = await fetch(
        reservoirURL + `?slug=${collection}`,
        options
      );
      const results = await res.json();
      const result = results.collections[0];
      return {
        fp: result.floorAsk.price.amount.decimal,
        content: formatDomain(result.floorAsk.sourceDomain, result)
      }
    }
    case "sol": {
      const res = await fetch(hyperspaceRestUrl + "/get-project-stats", {
        method: "POST",
        headers: {
          Authorization: hyperspaceToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conditions: {
            project_ids: [collection],
          },
        }),
      });
      const json = await res.json();
      return {
        fp: json.project_stats[0].floor_price,
        content: `https://hyperspace.xyz/collection/${collection}`
      }
    }
    default:
      throw new Error('no floor price found')
  }}
  catch {
    // If floor price retrieval fails, just return blank data
    return {
      fp: "",
      content: ""
    }
  }
};
