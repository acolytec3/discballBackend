export interface Subscription {
    collection: string,
    price: number,
    direction: string,
    chain: Chain
}

export enum Chain {
    Ethereum = "eth",
    Solana = "sol"
}