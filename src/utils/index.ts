import { JSBI, Percent, Token, TokenAmount, WETH } from '@josojo/honeyswap-sdk'
import { PublicClient, getAddress } from 'viem'

import { ChainId, NETWORK_CONFIGS } from './networkConfig'

export { ChainId }

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export const EASY_AUCTION_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x0b7fFc1f4AD541A4Ed16b40D8c37f0929158D101',
  [ChainId.GÖRLI]: '0x1fBAb40C338E2e7243DA945820Ba680C92EF8281',
  [ChainId.XDAI]: '0x0b7fFc1f4AD541A4Ed16b40D8c37f0929158D101',
  [ChainId.MATIC]: '0x0b7fFc1f4AD541A4Ed16b40D8c37f0929158D101',
  [ChainId.MUMBAI]: '0x4100aF1E6e8bBc174fc5da4D409e1e3C03F1f85E',
  [ChainId.AVALANCHE]: '0xb5D00F83680ea5E078e911995c64b43Fbfd1eE61',
  [ChainId.FUJI]: '0xa5cd8D8effACB7Ad861e3797404924199D1463a5',
  [ChainId.BSC]: '0x231F3Fd7c3E3C9a2c8A03B72132c31241DF0a26C',
  [ChainId.BSCTESTNET]: '0x231F3Fd7c3E3C9a2c8A03B72132c31241DF0a26C',
}

export const DEPOSIT_AND_PLACE_ORDER: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x10D15DEA67f7C95e2F9Fe4eCC245a8862b9B5B96',
  [ChainId.GÖRLI]: '0xc6e51F2cb369F03672197D0C31Dd5F0d9566217B',
  [ChainId.XDAI]: '0x845AbED0734e39614FEC4245F3F3C88E2da98157',
  [ChainId.MATIC]: '0x93D2BbA07b44e8F2b02F7DA164eE4f7442a3B618',
  [ChainId.MUMBAI]: '0x7f49Ee20f2E83Ca53B08944938E9B6Fad8e3E3B6',
  [ChainId.AVALANCHE]: '0x193c8993480DF4c1dBBdB39dB07511f7D789cedb',
  [ChainId.FUJI]: '0x39cbA0cC28EE67EAa8134C0e80a061c13EBC3603',
  [ChainId.BSC]: '0x4bAbb4b89ed7180aeF95F872f621afEE724F0344',
  [ChainId.BSCTESTNET]: '0x14082EDeFCa073578d2C16E8fB42967bEc188E59',
}

export const ALLOW_LIST_OFF_CHAIN_MANAGED: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x0F4648d997e486cE06577d6Ee2FecBcA84b834F4',
  [ChainId.GÖRLI]: '0xE0AD16EB7Ea467C694E6cFdd5E7D61FE850e8B53',
  [ChainId.XDAI]: '0x0F4648d997e486cE06577d6Ee2FecBcA84b834F4',
  [ChainId.MATIC]: '0x0480A370279B2e70378188E1bd4f1cD7D76D8aD2',
  [ChainId.MUMBAI]: '0xE0AD16EB7Ea467C694E6cFdd5E7D61FE850e8B53',
  [ChainId.AVALANCHE]: '0x5ae9b340A98085D0fc25Ae98A5eB704bA08E0dF8',
  [ChainId.FUJI]: '0x2f0045AA41879184a283A644F25Ec4FA31C8767E',
  [ChainId.BSC]: '0xE0AD16EB7Ea467C694E6cFdd5E7D61FE850e8B53',
  [ChainId.BSCTESTNET]: '0xE0AD16EB7Ea467C694E6cFdd5E7D61FE850e8B53',
}

const getExplorerPrefix = (chainId: ChainId) => {
  return (
    NETWORK_CONFIGS[chainId].blockExplorers?.default.url ||
    `https://${NETWORK_CONFIGS[chainId].blockExplorers?.default.url || ''}etherscan.io`
  )
}

export function getExplorerLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'address',
): string {
  const prefix = getExplorerPrefix(chainId)

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: bigint): bigint {
  return (value * (BigInt(10000) + BigInt(1000))) / BigInt(10000)
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: TokenAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ]
}

export function getEasyAuctionAddress(chainId: ChainId) {
  return EASY_AUCTION_NETWORKS[chainId]
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

// Always return a non-undefined token display
export function getTokenDisplay(token: Token, chainId: ChainId): string {
  if (isTokenXDAI(token.address, chainId)) return `XDAI`
  if (isTokenWETH(token.address, chainId)) return `ETH`
  if (isTokenWMATIC(token.address, chainId)) return `MATIC`
  return (
    token?.symbol?.slice(0, 7) || token?.name?.slice(0, 7) || token?.address.slice(0, 7) || '🤔'
  )
}

// Always return a non-undefined token display
export function getFullTokenDisplay(token: Token, chainId: ChainId): string {
  if (isTokenXDAI(token.address, chainId)) return `XDAI`
  if (isTokenWETH(token.address, chainId)) return `ETH`
  if (isTokenWMATIC(token.address, chainId)) return `MATIC`
  return token?.symbol || token?.name || token?.address || '🤔'
}

export function isTokenXDAI(tokenAddress?: string, chainId?: ChainId): boolean {
  return !!tokenAddress && !!chainId && tokenAddress == WETH[chainId]?.address && chainId === 100
}

export function isTokenWETH(tokenAddress?: string, chainId?: ChainId): boolean {
  return (
    !!tokenAddress &&
    !!chainId &&
    tokenAddress == WETH[chainId]?.address &&
    (chainId === 1 || chainId === 5)
  )
}

export function isTokenWMATIC(tokenAddress?: string, chainId?: ChainId): boolean {
  return !!tokenAddress && !!chainId && tokenAddress == WETH[chainId]?.address && chainId === 137
}

export function isTimeout(timeId: NodeJS.Timeout | undefined): timeId is NodeJS.Timeout {
  return typeof timeId !== 'undefined'
}

export const checkIsContract = async (provider: PublicClient, address: string) => {
  try {
    // @ts-ignore
    const code = await provider.getBytecode({ address })
    return code !== undefined
  } catch (error) {
    return false
  }
}
