import qs from "qs";

import type { BuildOptions, ChainId, ParseResult } from "./types";
import { assertAmount, getAmountKey, schema } from "./common";

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

    if (!uri.startsWith(schema)) {
        throw new Error(`Invalid schema URI`);
    }

    let address_regex = "(0x[0-9a-fA-F]{1,64})"; // valid StarkNet address regex
    let prefix = undefined;

    if (!uri.startsWith(`${schema}0x`)) {
        // a non-address prefix must end with "-"
        const prefixEnd = uri.indexOf("-", schema.length);
        if (prefixEnd === -1) {
            throw new Error("Missing prefix");
        }

        prefix = uri.substring(schema.length, prefixEnd);

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
            `^${schema}(${prefix}-)?${address_regex}\\@?(\\w*)*\\/?(\\w*)*`
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
            schema: schema.replace(":", ""),
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
export const build = (options: BuildOptions) => {
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

    let url = schema;
    if (prefix) url += `${prefix}-`; // i.e. "pay-"
    url += target_address;
    if (chain_id) url += `@${chain_id}`;
    if (function_name) url += `/${function_name}`;
    if (queryParams) url += `?${queryParams}`;

    return url;
};
