
export const formatDomain = (domain: string, collection: any) => {
    switch (domain) {
      case "reservoir.tools": {
        return `https://reservoir.market/collections/${collection.primaryContract}`;
      }
      case "looksrare.org": {
        return `https://looksrare.org/collections/${collection.primaryContract}`
      }
      default: {
        return `https://${domain}/collection/${collection.name.toLowerCase()}`;
      }
    }
  };
  