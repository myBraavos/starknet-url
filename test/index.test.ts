import { build, parse } from "../src";
import { assertAmount, getAmountKey } from "../src/common";

const STARKNET_ACCOUNT =
    "0x0603202200000000000000000000000000000000000000000000000000001015";
const STARKNET_ETH =
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

describe("parse", () => {
    it("should parse URI with payload starting with `0x`", () => {
        expect(parse(`starknet:${STARKNET_ACCOUNT}`)).toEqual({
            schema: "starknet",
            target_address: STARKNET_ACCOUNT,
        });
    });

    it("should parse URI with payload starting with `0x` and `pay` prefix", () => {
        expect(parse("starknet:pay-" + STARKNET_ACCOUNT)).toEqual({
            schema: "starknet",
            prefix: "pay",
            target_address: STARKNET_ACCOUNT,
        });
    });

    it("should parse URI with payload starting with `0x` and `foo` prefix", () => {
        expect(parse("starknet:foo-" + STARKNET_ACCOUNT)).toEqual({
            schema: "starknet",
            prefix: "foo",
            target_address: STARKNET_ACCOUNT,
        });
    });

    it("should parse URI with a domain name", () => {
        expect(parse("starknet:foo-first-sword-of-braavos.stark")).toEqual({
            schema: "starknet",
            prefix: "foo",
            target_address: "first-sword-of-braavos.stark",
        });
    });

    it("should parse URI with chain id", () => {
        expect(parse(`starknet:${STARKNET_ACCOUNT}@SN_GOERLI`)).toEqual({
            schema: "starknet",
            target_address: STARKNET_ACCOUNT,
            chain_id: "SN_GOERLI",
        });
    });

    it("should parse an ERC20 token transfer", () => {
        expect(
            parse(
                `starknet:${STARKNET_ETH}/transfer?address=${STARKNET_ACCOUNT}&uint256=1`
            )
        ).toEqual({
            schema: "starknet",
            target_address: STARKNET_ETH,
            function_name: "transfer",
            parameters: {
                address: STARKNET_ACCOUNT,
                uint256: "1",
            },
        });
    });

    it("should parse a url with value and gas parameters", () => {
        expect(
            parse(
                `starknet:${STARKNET_ETH}?value=2.014e18&gas=10&gasLimit=21000&gasPrice=50`
            )
        ).toEqual({
            schema: "starknet",
            target_address: STARKNET_ETH,
            parameters: {
                value: "2014000000000000000",
                gas: "10",
                gasLimit: "21000",
                gasPrice: "50",
            },
        });
    });
});

describe("build", () => {
    it("should build a URL with payload starting with `0x`", () => {
        expect(
            build({
                target_address: STARKNET_ACCOUNT,
            })
        ).toEqual(`starknet:${STARKNET_ACCOUNT}`);
    });

    it("should build a URL with payload starting with `0x` and `pay` prefix", () => {
        expect(
            build({
                prefix: "pay",
                target_address: STARKNET_ACCOUNT,
            })
        ).toEqual(`starknet:pay-${STARKNET_ACCOUNT}`);
    });

    it("should build a URL with payload starting with `0x` and `foo` prefix", () => {
        expect(
            build({
                prefix: "foo",
                target_address: STARKNET_ACCOUNT,
            })
        ).toEqual(`starknet:foo-${STARKNET_ACCOUNT}`);
    });

    it("should build a URL with a domain name", () => {
        expect(
            build({
                prefix: "foo",
                target_address: "first-sword-of-braavos.stark",
            })
        ).toEqual("starknet:foo-first-sword-of-braavos.stark");
    });

    it("should build a URL with chain id", () => {
        expect(
            build({
                target_address: STARKNET_ACCOUNT,
                chain_id: "SN_GOERLI",
            })
        ).toEqual(`starknet:${STARKNET_ACCOUNT}@SN_GOERLI`);
    });

    it("should build a URL for an ERC20 token transfer", () => {
        expect(
            build({
                target_address: STARKNET_ETH,
                function_name: "transfer",
                parameters: {
                    address: STARKNET_ACCOUNT,
                    uint256: "1",
                },
            })
        ).toEqual(
            `starknet:${STARKNET_ETH}/transfer?address=${STARKNET_ACCOUNT}&uint256=1`
        );
    });

    it("should build a url with value and gas parameters", () => {
        expect(
            build({
                target_address: STARKNET_ETH,
                parameters: {
                    value: "2014000000000000000",
                    gas: "10",
                    gasLimit: "21000",
                    gasPrice: "50",
                },
            })
        ).toEqual(
            `starknet:${STARKNET_ETH}?value=2.014e18&gas=10&gasLimit=21000&gasPrice=50`
        );
    });
});

describe("common", () => {
    it("should return correct amount-key for `foo`", function () {
        expect(getAmountKey("foo")).toEqual("value");
    });

    it("should return correct amount-key for undefined", function () {
        expect(getAmountKey(undefined)).toEqual("value");
    });

    it("should return correct amount-key for `transfer`", function () {
        expect(getAmountKey("transfer")).toEqual("uint256");
    });

    it("should assert-amount for undefined", function () {
        // @ts-ignore
        expect(() => assertAmount(undefined)).toThrow();
    });

    it("should assert-amount for text", function () {
        expect(() => assertAmount("foo")).toThrow();
    });

    it("should assert-amount for negative number-string", function () {
        expect(() => assertAmount("-1")).toThrow();
    });

    it("should assert-amount for negative number", function () {
        // @ts-ignore
        expect(() => assertAmount(-1)).toThrow();
    });

    it("should assert-amount for empty string", function () {
        expect(() => assertAmount("")).not.toThrow();
    });

    it("should assert-amount for number", function () {
        // @ts-ignore
        expect(() => assertAmount(0.1)).not.toThrow();
    });

    it("should assert-amount for number-string", function () {
        expect(() => assertAmount("0.1e18")).not.toThrow();
    });
});
