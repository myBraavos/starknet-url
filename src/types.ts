export enum StarknetChainId {
    MAINNET = "0x534e5f4d41494e",
    GOERLI = "0x534e5f474f45524c49",
    GOERLI2 = "0x534e5f474f45524c4932",
}

export type ChainId = StarknetChainId | string | number;

export type ParseResult = {
    schema: string;
    prefix?: string;
    target_address: string;
    chain_id?: ChainId;
    function_name?: string;
    parameters?: { [key: string]: string };
};

export type BuildOptions = Omit<ParseResult, "schema">;

export type Token = { token_address: string; chainId: ChainId };

export type TransferOptions = {
    token: Token;
    amount?: string | number;
};
