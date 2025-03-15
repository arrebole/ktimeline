import { type IndicatorTemplate, IndicatorSeries } from 'klinecharts'

interface Ma {
  ma1?: number
  ma2?: number
  ma3?: number
  ma4?: number
}

/**
 * MA 移动平均
 */
export const movingAverage: IndicatorTemplate<Ma, number> = {
  name: 'MYMA',
  shortName: 'MA',
  series: IndicatorSeries.Price,
  calcParams: [5, 34, 170],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'ma1', title: 'MA5: ', type: 'line' },
    { key: 'ma2', title: 'MA34: ', type: 'line' },
    { key: 'ma3', title: 'MA170: ', type: 'line' },
  ],
  regenerateFigures: (params) => params.map((p, i) => ({ key: `ma${i + 1}`, title: `MA${p}: `, type: 'line' })),
  calc: (dataList, indicator) => {
    const { calcParams: params, figures } = indicator
    const closeSums: number[] = []
    return dataList.map((kLineData, i) => {
      const ma: any = {}
      const close = kLineData.close
      params.forEach((p, index) => {
        closeSums[index] = (closeSums[index] ?? 0) + close
        if (i >= p - 1) {
          ma[figures[index].key] = closeSums[index] / p
          closeSums[index] -= dataList[i - (p - 1)].close
        }
      })
      return ma
    })
  }
}