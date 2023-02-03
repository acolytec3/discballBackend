export async function queryFauna(
    query: string,
    variables: { [key: string]: unknown }
  ): Promise<{
    data?: any;
    error?: any;
  }> {
    const token = Deno.env.get("FAUNA_SECRET");
    if (!token) {
      throw new Error("environment variable FAUNA_SECRET not set");
    }
  
    try {
      const res = await fetch("https://graphql.us.fauna.com/graphql", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });
  
      const { data, errors } = await res.json();
      if (errors) {
        // Return the first error if there are any.
        return { data, error: errors[0] };
      }
  
      return { data };
    } catch (error) {
      return { error };
    }
  }