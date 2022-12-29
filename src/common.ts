export const getAmountKey = (functionName: string | undefined) =>
    functionName === "transfer" ? "uint256" : "value";

export const assertAmount = (amount: string) => {
    const num = Number(amount);
    if (!Number.isFinite(num) || num < 0) {
        throw new Error(`Invalid amount: "${amount}"`);
    }
};

export const assertStarknetAddress = (address: string): boolean => {
    if (!new RegExp(`^${STARKNET_ADDRESS_REGEX}$`).test(address)) {
        throw new Error(`Invalid StarkNet address: "${address}"`);
    }
    return true;
};

export const STARKNET_SCHEMA = "starknet:";

/**
 * valid StarkNet address regex
 */
export const STARKNET_ADDRESS_REGEX = "0x[0-9a-fA-F]{1,64}";

export const STARKNET_ETH =
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export enum StarknetChainId {
    // noinspection JSUnusedGlobalSymbols
    MAINNET = "0x534e5f4d41494e",
    GOERLI = "0x534e5f474f45524c49",
    GOERLI2 = "0x534e5f474f45524c4932",
}
