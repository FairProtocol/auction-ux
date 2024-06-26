import { Token } from '@josojo/honeyswap-sdk'

import { STABLE_TOKENS_FOR_INVERTED_CHARTS } from '../constants/config'
import { tryParseAmount } from '../state/orderPlacement/hooks'

export function getInverse(price: string, nrDigits: number): string {
  if (price == '-') {
    return '-'
  }

  // prevent division by 0
  if (price === '0') {
    return price
  }

  // if 1/price has more than `nrDigits`, we make a cut off and only take the first `nrDigits`
  const re = new RegExp('(\\d+\\.\\d{' + nrDigits + '})(\\d)')
  const m = (1 / Number(price)).toString().match(re)

  return (m ? parseFloat(m[1]) : (1 / Number(price)).valueOf()).toString()
}

export function convertPriceIntoBuyAndSellAmount(
  auctioningToken: Token | undefined,
  biddingToken: Token | undefined,
  price: string,
  sellAmount: string,
): {
  sellAmountScaled: bigint | undefined
  buyAmountScaled: bigint | undefined
} {
  if (auctioningToken == undefined || biddingToken == undefined) {
    return {
      sellAmountScaled: undefined,
      buyAmountScaled: undefined,
    }
  }
  const sellAmountScaled = tryParseAmount(sellAmount, biddingToken)
  if (sellAmountScaled == undefined) {
    return { sellAmountScaled: undefined, buyAmountScaled: undefined }
  }
  const inversePriceAdjustedBybiddingToken = tryParseAmount(price, biddingToken)
  if (inversePriceAdjustedBybiddingToken == undefined) {
    return { sellAmountScaled: undefined, buyAmountScaled: undefined }
  }
  const buyAmountScaled =
    (BigInt(sellAmountScaled.raw.toString()) * BigInt(10) ** BigInt(auctioningToken.decimals)) /
    BigInt(inversePriceAdjustedBybiddingToken.raw.toString())
  return {
    sellAmountScaled: BigInt(sellAmountScaled.raw.toString()),
    buyAmountScaled,
  }
}

export function showChartsInverted(token: Token): boolean {
  return STABLE_TOKENS_FOR_INVERTED_CHARTS.includes(token.address)
}
