export const getAmountKey = (functionName: string | undefined) =>
    functionName === "transfer" ? "uint256" : "value";

export const assertAmount = (amount: string) => {
    const num = Number(amount);
    if (!Number.isFinite(num) || num < 0) {
        throw new Error(`Invalid amount: "${amount}"`);
    }
};

export const schema = "starknet:";
