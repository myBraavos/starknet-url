# starknet-url

StarkNet URL generator & parser.
\
Supporting common Ethereum URL standards such as [ERC-681](https://eips.ethereum.org/EIPS/eip-681) and [ERC-831](https://eips.ethereum.org/EIPS/eip-831).
\
\
This is a base standardizing lib to be used mainly by infrastructure devs/builders.\
Use [starknet-deeplink](https://www.npmjs.com/package/starknet-deeplink)
for easily generating StarkNet deeplinks - such as payment requests, dApp launching, and more.
## Installation

using npm -
```bash
  npm install starknet-url
```
or yarn -

```bash
  yarn add starknet-url
``` 


## Examples

Goerli ETH payment request:

```javascript
import { STARKNET_ETH, StarknetChainId, transfer } from 'starknet-url'

const beneficiaryAddress = "0x123456789abcdef";
const url = transfer(beneficiaryAddress, {
    token: {
        token_address: STARKNET_ETH,
        chainId: StarknetChainId.GOERLI
    },
    amount: 0.02
})

// "starknet:0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7@0x534e5f474f45524c49/transfer?address=0x123456789abcdef&uint256=2e-2"
```
\
Add (listing) token request:

```javascript
import { addToken, StarknetChainId } from 'starknet-url'


const url = addToken({
    token_address: "0x123456789abcdef",
    chainId: StarknetChainId.GOERLI,
});

// "starknet:0x123456789abcdef@0x534e5f474f45524c49/watchAsset?type=ERC20"
```
\
dApp launching request:

```javascript
import { dapp } from 'starknet-url'


const url = dapp("https://example.com");

// "starknet:dapp-example.com"
```
\
Custom URI:

```javascript
import { build, parse } from 'starknet-url'


// build a custom URI
const url = build({
    target_address: "0x12456789abcdef",
    function_name: "custom",
    chain_id: "0x13579",
    parameters: {
        "my": "custom",
        "function": "params",
    },
})
// "starknet:0x12456789abcdef@0x13579/custom?my=custom&function=params"

// parse a custom URI
const parsed = parse(url);
/*
    {
      schema: "starknet",
      target_address: "0x12456789abcdef",
      chain_id: "0x13579",
      function_name: "custom",
      parameters: { my: "custom", function: "params" }
    }
*/
```
## API Reference

### build _(options: BuildOptions)_
Build a StarkNet URI.
\
returns a URI `string`

| Parameter | Type           | Description                              |
|:----------|:---------------|:-----------------------------------------|
| `options` | `BuildOptions` | **Required**. StarkNet URI build options |


### parse _(uri: string)_
Parse a StarkNet URI.
\
returns a `ParseResult` object

| Parameter | Type     | Description                |
|:----------|:---------|:---------------------------|
| `uri`     | `string` | **Required**. StarkNet URI |

### transfer _(to_address: string, options: TransferOptions)_
Generate a `transfer` StarkNet URI, i.e. for a payment request.
\
returns a URI `string`

| Parameter    | Type              | Description                                                                           |
|:-------------|:------------------|:--------------------------------------------------------------------------------------|
| `to_address` | `string`          | **Required**. beneficiary address                                                     |
| `options`    | `TransferOptions` | **Required**. defines a token to be used, and optionally the amount to be transferred |

### addToken _(token: Token)_
Generate a `watchAsset` StarkNet URI, for watching the given token (asset).
\
returns a URI `string`

| Parameter | Type    | Description                                                               |
|:----------|:--------|:--------------------------------------------------------------------------|
| `token`   | `Token` | **Required**. the token to be added (listed) by this `watchAsset` request |

### dapp _(url: string)_
Generate a `dapp` StarkNet URI, for launching a dApp in a StarkNet supporting browser client.
\
returns a URI `string`

| Parameter | Type     | Description            |
|:----------|:---------|:-----------------------|
| `url`     | `string` | **Required**. dapp url |

### Types

#### BuildOptions

| Parameter        | Type                | Description                                                                                                                            |
|:-----------------|:--------------------|:---------------------------------------------------------------------------------------------------------------------------------------|
| `target_address` | `string`            | **Required**. defines either the beneficiary of native token payment, or the contract address with which the user is asked to interact |
| `prefix`         | `string`            | **Optional**. defines the use-case for this URI                                                                                        |
| `chain_id`       | `string`            | **Optional**. defines the decimal chain ID, such that transactions on various test- and private networks can be requested              |
| `function_name`  | `string`            | **Optional**. `transfer`, `dapp`, `watchAsset`, etc.                                                                                   |
| `parameters`     | `{ [key]: string }` | **Optional**. defines extra parameters per use-case                                                                                    |

#### ParseResult

Same as *BuildOptions* (per given URI use-case), plus `schema` which must always be `starknet:`

#### Token
| Parameter       | Type      | Description                            |
|:----------------|:----------|:---------------------------------------|
| `token_address` | `string`  | **Required**. the token address        |
| `chainId`       | `ChainId` | **Required**. token address's chain ID |

#### ChainId
Could be either `StarknetChainId`, `string` or a `number` (hex)

#### StarknetChainId
`enum` of common StarkNet chain IDs, such as -
```
    MAINNET = "0x534e5f4d41494e",
    GOERLI = "0x534e5f474f45524c49",
    GOERLI2 = "0x534e5f474f45524c4932",
```
## Acknowledgements
This lib is inspired by the excellent Ethereum (L1) build/parse lib: [eth-url-parser](https://github.com/brunobar79/eth-url-parser).

## License

[MIT](https://choosealicense.com/licenses/mit/)


## Related

[starknet-deeplink](https://www.npmjs.com/package/starknet-deeplink) - StarkNet deeplink generator
