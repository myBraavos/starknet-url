import { build, dapp, parse, transfer } from "../src";
import {
    assertAmount,
    assertStarknetAddress,
    getAmountKey,
    STARKNET_ETH,
    STARKNET_SCHEMA,
} from "../src/common";

const STARKNET_TEST_ACCOUNT =
    "0x0603202200000000000000000000000000000000000000000000000000001015";

describe("parse", () => {
    it("should parse URI with payload starting with `0x`", () => {
        expect(parse(`${STARKNET_SCHEMA}${STARKNET_TEST_ACCOUNT}`)).toEqual({
            schema: "starknet",
            target_address: STARKNET_TEST_ACCOUNT,
        });
    });

    it("should parse URI with payload starting with `0x` and `pay` prefix", () => {
        expect(parse(`${STARKNET_SCHEMA}pay-${STARKNET_TEST_ACCOUNT}`)).toEqual(
            {
                schema: "starknet",
                prefix: "pay",
                target_address: STARKNET_TEST_ACCOUNT,
            }
        );
    });

    it("should parse URI with payload starting with `0x` and `foo` prefix", () => {
        expect(parse(`${STARKNET_SCHEMA}foo-${STARKNET_TEST_ACCOUNT}`)).toEqual(
            {
                schema: "starknet",
                prefix: "foo",
                target_address: STARKNET_TEST_ACCOUNT,
            }
        );
    });

    it("should parse URI with a domain name", () => {
        expect(
            parse(`${STARKNET_SCHEMA}foo-first-sword-of-braavos.stark`)
        ).toEqual({
            schema: "starknet",
            prefix: "foo",
            target_address: "first-sword-of-braavos.stark",
        });
    });

    it("should parse URI with chain id", () => {
        expect(
            parse(`${STARKNET_SCHEMA}${STARKNET_TEST_ACCOUNT}@SN_GOERLI`)
        ).toEqual({
            schema: "starknet",
            target_address: STARKNET_TEST_ACCOUNT,
            chain_id: "SN_GOERLI",
        });
    });

    it("should parse an ERC20 token transfer", () => {
        expect(
            parse(
                `${STARKNET_SCHEMA}${STARKNET_ETH}/transfer?address=${STARKNET_TEST_ACCOUNT}&uint256=1`
            )
        ).toEqual({
            schema: "starknet",
            target_address: STARKNET_ETH,
            function_name: "transfer",
            parameters: {
                address: STARKNET_TEST_ACCOUNT,
                uint256: "1",
            },
        });
    });

    it("should parse a url with value and gas parameters", () => {
        expect(
            parse(
                `${STARKNET_SCHEMA}${STARKNET_ETH}?value=2.014e18&gas=10&gasLimit=21000&gasPrice=50`
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
                target_address: STARKNET_TEST_ACCOUNT,
            })
        ).toEqual(`${STARKNET_SCHEMA}${STARKNET_TEST_ACCOUNT}`);
    });

    it("should build a URL with payload starting with `0x` and `pay` prefix", () => {
        expect(
            build({
                prefix: "pay",
                target_address: STARKNET_TEST_ACCOUNT,
            })
        ).toEqual(`${STARKNET_SCHEMA}pay-${STARKNET_TEST_ACCOUNT}`);
    });

    it("should build a URL with payload starting with `0x` and `foo` prefix", () => {
        expect(
            build({
                prefix: "foo",
                target_address: STARKNET_TEST_ACCOUNT,
            })
        ).toEqual(`${STARKNET_SCHEMA}foo-${STARKNET_TEST_ACCOUNT}`);
    });

    it("should build a URL with a domain name", () => {
        expect(
            build({
                prefix: "foo",
                target_address: "first-sword-of-braavos.stark",
            })
        ).toEqual(`${STARKNET_SCHEMA}foo-first-sword-of-braavos.stark`);
    });

    it("should build a URL with chain id", () => {
        expect(
            build({
                target_address: STARKNET_TEST_ACCOUNT,
                chain_id: "SN_GOERLI",
            })
        ).toEqual(`${STARKNET_SCHEMA}${STARKNET_TEST_ACCOUNT}@SN_GOERLI`);
    });

    it("should build a URL for an ERC20 token transfer", () => {
        expect(
            build({
                target_address: STARKNET_ETH,
                function_name: "transfer",
                parameters: {
                    address: STARKNET_TEST_ACCOUNT,
                    uint256: "1",
                },
            })
        ).toEqual(
            `${STARKNET_SCHEMA}${STARKNET_ETH}/transfer?address=${STARKNET_TEST_ACCOUNT}&uint256=1`
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
            `${STARKNET_SCHEMA}${STARKNET_ETH}?value=2.014e18&gas=10&gasLimit=21000&gasPrice=50`
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
        // @ts-expect-error TS2345 we want to test raw js access
        expect(() => assertAmount(undefined)).toThrow();
    });

    it("should assert-amount for text", function () {
        expect(() => assertAmount("foo")).toThrow();
    });

    it("should assert-amount for negative number-string", function () {
        expect(() => assertAmount("-1")).toThrow();
    });

    it("should assert-amount for negative number", function () {
        // @ts-expect-error TS2345 we want to test raw js access
        expect(() => assertAmount(-1)).toThrow();
    });

    it("should assert-amount for empty string", function () {
        expect(() => assertAmount("")).not.toThrow();
    });

    it("should assert-amount for number", function () {
        // @ts-expect-error TS2345 we want to test raw js access
        expect(() => assertAmount(0.1)).not.toThrow();
    });

    it("should assert-amount for number-string", function () {
        expect(() => assertAmount("0.1e18")).not.toThrow();
    });

    it("should assert-address for undefined", function () {
        // @ts-expect-error TS2345 we want to test raw js access
        expect(() => assertStarknetAddress(undefined)).toThrow();
    });

    it("should assert-address for text", function () {
        expect(() => assertStarknetAddress("foo")).toThrow();
    });

    it("should assert-address for invalid prefixes", function () {
        expect(() => assertStarknetAddress(" 0x0")).toThrow();
        expect(() => assertStarknetAddress("-0x0")).toThrow();
        expect(() => assertStarknetAddress("\n0x0")).toThrow();
    });

    it("should assert-address for empty string", function () {
        expect(() => assertStarknetAddress("")).toThrow();
    });

    it("should assert-address for number", function () {
        // @ts-expect-error TS2345 we want to test raw js access
        expect(() => assertStarknetAddress(0.1)).toThrow();
    });

    it("should assert-address for too short", function () {
        expect(() => assertStarknetAddress("0x")).toThrow();
    });

    it("should assert-address for too long", function () {
        expect(() =>
            assertStarknetAddress(`${STARKNET_TEST_ACCOUNT}000`)
        ).toThrow();
    });

    it("should assert-address for short", function () {
        expect(() => assertStarknetAddress("0x0")).toBeTruthy();
    });

    it("should assert-address for long", function () {
        expect(() => assertStarknetAddress(STARKNET_TEST_ACCOUNT)).toBeTruthy();
    });
});

describe("dapp", () => {
    it("should handle https url", function () {
        expect(dapp("https://www.example.com/#/")).toEqual(
            `${STARKNET_SCHEMA}dapp-www.example.com/#/`
        );
    });

    it("should handle http url", function () {
        // noinspection HttpUrlsUsage
        expect(dapp("http://example.com?q=1")).toEqual(
            `${STARKNET_SCHEMA}dapp-example.com?q=1`
        );
    });

    it("should keep qs and hash", function () {
        expect(dapp("https://example.com/#foo?q=1")).toEqual(
            `${STARKNET_SCHEMA}dapp-example.com/#foo?q=1`
        );
    });

    it("should throw on invalid protocol", function () {
        expect(() => dapp("ftp://example.com")).toThrow();
    });

    it("should throw on missing protocol", function () {
        expect(() => dapp("example.com")).toThrow();
        expect(() => dapp("www.example.com")).toThrow();
    });

    it("should throw on invalid domain", function () {
        expect(() => dapp("example")).toThrow();
    });

    it("should throw on empty string", function () {
        expect(() => dapp("")).toThrow();
    });
});

describe("transfer", () => {
    it("should generate a mainnet eth request with no amount", function () {
        expect(transfer(STARKNET_TEST_ACCOUNT)).toEqual(
            `${STARKNET_SCHEMA}${STARKNET_ETH}@SN_MAIN/transfer?address=${STARKNET_TEST_ACCOUNT}`
        );
    });

    it("should generate a mainnet eth request with amount", function () {
        expect(transfer(STARKNET_TEST_ACCOUNT, { amount: 1.1 })).toEqual(
            `${STARKNET_SCHEMA}${STARKNET_ETH}@SN_MAIN/transfer?address=${STARKNET_TEST_ACCOUNT}&uint256=1.1`
        );
    });

    it("should generate a custom token request with no amount", function () {
        expect(
            transfer(STARKNET_TEST_ACCOUNT, {
                token: { token_address: "0x12345", chainId: "SN_GOERLI2" },
            })
        ).toEqual(
            `${STARKNET_SCHEMA}0x12345@SN_GOERLI2/transfer?address=${STARKNET_TEST_ACCOUNT}`
        );
    });

    it("should generate a custom token request with amount", function () {
        expect(
            transfer(STARKNET_TEST_ACCOUNT, {
                token: { token_address: "0x12345", chainId: "SN_GOERLI2" },
                amount: "0o377777777777777777",
            })
        ).toEqual(
            `${STARKNET_SCHEMA}0x12345@SN_GOERLI2/transfer?address=${STARKNET_TEST_ACCOUNT}&uint256=9.007199254740991e15`
        );

        expect(
            transfer(STARKNET_TEST_ACCOUNT, {
                token: { token_address: "0x12345", chainId: "SN_GOERLI2" },
                amount: "9007199254740991",
            })
        ).toEqual(
            `${STARKNET_SCHEMA}0x12345@SN_GOERLI2/transfer?address=${STARKNET_TEST_ACCOUNT}&uint256=9.007199254740991e15`
        );

        expect(
            transfer(STARKNET_TEST_ACCOUNT, {
                token: { token_address: "0x12345", chainId: "SN_GOERLI2" },
                amount: "0x1fffffffffffff",
            })
        ).toEqual(
            `${STARKNET_SCHEMA}0x12345@SN_GOERLI2/transfer?address=${STARKNET_TEST_ACCOUNT}&uint256=9.007199254740991e15`
        );

        expect(
            transfer(STARKNET_TEST_ACCOUNT, {
                token: { token_address: "0x12345", chainId: "SN_GOERLI2" },
                amount: "0b11111111111111111111111111111111111111111111111111111",
            })
        ).toEqual(
            `${STARKNET_SCHEMA}0x12345@SN_GOERLI2/transfer?address=${STARKNET_TEST_ACCOUNT}&uint256=9.007199254740991e15`
        );
    });

    it("should throw on invalid to_address", function () {
        expect(() => transfer("0x")).toThrow();
    });

    it("should throw on invalid token option", function () {
        expect(() =>
            // @ts-expect-error TS2322 we want to test raw js access
            transfer(STARKNET_TEST_ACCOUNT, { token: null })
        ).toThrow();
    });

    it("should throw on invalid token_address", function () {
        expect(() =>
            // @ts-expect-error TS2322 we want to test raw js access
            transfer(STARKNET_TEST_ACCOUNT, { token: { token_address: null } })
        ).toThrow();
    });

    it("should throw on invalid amount", function () {
        expect(() =>
            transfer(STARKNET_TEST_ACCOUNT, { amount: "foo" })
        ).toThrow();

        expect(() =>
            transfer(STARKNET_TEST_ACCOUNT, {
                amount: Number.POSITIVE_INFINITY,
            })
        ).toThrow();

        expect(() => transfer(STARKNET_TEST_ACCOUNT, { amount: -1 })).toThrow();
    });
});
