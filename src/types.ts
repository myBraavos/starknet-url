import { StarknetChainId } from "./common";

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
