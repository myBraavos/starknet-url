import qs from "qs";

import type {
    BuildOptions,
    ChainId,
    ParseResult,
    Token,
    TransferOptions,
} from "./types";
import {
    assertAmount,
    assertStarknetAddress,
    getAmountKey,
    STARKNET_ADDRESS_REGEX,
    STARKNET_SCHEMA,
} from "./common";
import isURL from "validator/lib/isURL";

/**
 * Parse a StarkNet URI
 *
 * @param uri StarkNet URI
 */
export const parse = (uri: string): ParseResult => {
    // noinspection SuspiciousTypeOfGuard
    if (typeof uri !== "string") {
        throw new Error(`"uri" must be a string`);
    }

    if (!uri.startsWith(STARKNET_SCHEMA)) {
        throw new Error(`Invalid schema URI`);
    }

    let address_regex = `(${STARKNET_ADDRESS_REGEX})`;
    let prefix = undefined;

    if (!uri.startsWith(`${STARKNET_SCHEMA}0x`)) {
        // a non-address prefix must end with "-"
        const prefixEnd = uri.indexOf("-", STARKNET_SCHEMA.length);
        if (prefixEnd === -1) {
            throw new Error("Missing prefix");
        }

        prefix = uri.substring(STARKNET_SCHEMA.length, prefixEnd);

        const restOfURI = uri.substring(prefixEnd + 1);
        if (!restOfURI.toLowerCase().startsWith("0x")) {
            // FIXME ATM there is no clear standard for StarkNet domains,
            //  the following is a super naive implementation

            // `target_address` is a domain - so we should validate it as one
            address_regex =
                "([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,})";
        }
    }

    const matched = uri.match(
        new RegExp(
            `^${STARKNET_SCHEMA}(${prefix}-)?${address_regex}\\@?(\\w*)*\\/?(\\w*)*`
        )
    );
    if (!matched) {
        throw new Error("URI parsing failed");
    }

    const [, , target_address, chain_id, function_name] = matched;

    // `value` type must be either a string or a number
    const parameters = Object.entries(qs.parse(uri.split("?")?.[1])).reduce<{
        [key: string]: string | number;
    }>(
        (params, [key, value]) => ({
            ...params,
            [key]: `${value}`, // force string `value` to avoid nested-params/arrays
        }),
        {}
    );

    const amountKey = getAmountKey(function_name);
    if (parameters[amountKey]) {
        // `amountKey` value type should be either `string` or `number`
        const givenAmount = parameters[amountKey] as string;

        const actualAmount = Number(givenAmount).toString();
        assertAmount(actualAmount);
        parameters[amountKey] = actualAmount;
    }

    // remove `undefined` keys
    return JSON.parse(
        JSON.stringify({
            schema: STARKNET_SCHEMA.replace(":", ""),
            prefix,
            target_address,
            chain_id: chain_id as ChainId,
            function_name,
            parameters: Object.keys(parameters).length ? parameters : undefined,
        })
    );
};

/**
 * Build a StarkNet URI
 *
 * @param options
 */
export const build = (options: BuildOptions): string => {
    const { prefix, target_address, chain_id, function_name, parameters } =
        options;

    if (!target_address) {
        throw new Error(`"target_address" must be defined`);
    }

    let queryParams;
    if (parameters) {
        const amountKey = getAmountKey(function_name);
        if (parameters[amountKey]) {
            const givenAmount = parameters[amountKey];
            const actualAmount = Number(givenAmount)
                .toLocaleString("en-US", {
                    notation: "scientific",
                    maximumFractionDigits: 20,
                })
                .replace(/e0/i, "")
                .toLowerCase();
            assertAmount(actualAmount);
            parameters[amountKey] = actualAmount;
        }
        queryParams = qs.stringify(parameters);
    }

    let url = STARKNET_SCHEMA;
    if (prefix) url += `${prefix}-`; // i.e. "pay-"
    url += target_address;
    if (chain_id) url += `@${chain_id}`;
    if (function_name) url += `/${function_name}`;
    if (queryParams) url += `?${queryParams}`;

    return url;
};

/**
 * Generate a "dapp" StarkNet URI
 *
 * @param url dapp url
 */
export const dapp = (url: string): string => {
    if (!isURL(url, { protocols: ["https", "http"], require_protocol: true })) {
        throw new Error(`Invalid url: "${url}"`);
    }

    return build({
        prefix: "dapp",
        target_address: url.replace(/(https?):\/\//, ""),
    });
};

/**
 * Generate a "transfer" StarkNet URI
 *
 * @param to_address target address
 * @param options - `token` to be used by this transfer,
 *                  `amount` requested (optional)
 */
export const transfer = (
    to_address: string,
    options: TransferOptions
): string => {
    assertStarknetAddress(to_address);

    const { token, amount } = options;
    assertStarknetAddress(token.token_address);
    if (!token.chainId) {
        throw new Error(`Missing "chainId"`);
    }

    const parameters: { [key: string]: string } = { address: to_address };
    if (amount) {
        parameters[getAmountKey("transfer")] = `${amount}`;
    }

    return build({
        // deliberately skipping the legacy "pay-" prefix,
        // the "transfer" `function_name` is clear enough
        // prefix: "pay",

        target_address: token.token_address,
        chain_id: token.chainId,
        function_name: "transfer",
        parameters,
    });
};

/**
 * Generate a "watchAsset" StarkNet URI for watching the given token
 *
 * @param token  to be added by this watchAsset request
 */
export const addToken = (token: Token): string => {
    assertStarknetAddress(token.token_address);
    if (!token.chainId) {
        throw new Error(`Missing "chainId"`);
    }

    return build({
        target_address: token.token_address,
        chain_id: token.chainId,
        function_name: "watchAsset",
        parameters: { type: "ERC20" },
    });
};

export { STARKNET_SCHEMA };
export type { Token, TransferOptions, BuildOptions, ChainId, ParseResult };
