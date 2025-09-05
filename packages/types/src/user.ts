export interface PositionInterface{
    entryTimeStamp: number,
    type: "buy" | "sell",
    asset: string,
    quantity: number,
    entryPrice: number,
    stopLoss?: number,
    margin?: number | null,
    takeProfit?: number | null,
    leverage?: number,
}

export interface OrderInterface extends PositionInterface {
    exitPrice: number,
    exitTimeStamp: number
}

interface assetBalance {
    [asset: string]: {
        quantity: number,
        type?: "buy" | "sell" 
    }
}

export interface UserInterface {
    id: string,
    email: string,
    password: string,
    balance: assetBalance,
    openPositions: PositionInterface[],
    orderHistory: OrderInterface[]
}