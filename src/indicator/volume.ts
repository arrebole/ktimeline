

import { type IndicatorTemplate, IndicatorSeries, type IndicatorFigure } from 'klinecharts'

interface Vol {
    open: number
    close: number
    volume?: number
    ma1?: number
    ma2?: number
    ma3?: number
}

const reEscapeChar = /\\(\\)?/g
const rePropName = RegExp(
    '[^.[\\]]+' + '|' +
    '\\[(?:' +
    '([^"\'][^[]*)' + '|' +
    '(["\'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2' +
    ')\\]' + '|' +
    '(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))'
    , 'g');

function isValid<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined
}

export function formatValue(data: unknown, key: string, defaultValue?: unknown): unknown {
    if (isValid(data)) {
        const path: string[] = []
        key.replace(rePropName, (subString: string, ...args: unknown[]) => {
            let k = subString
            if (isValid(args[1])) {
                k = (args[2] as string).replace(reEscapeChar, '$1')
            } else if (isValid(args[0])) {
                k = (args[0] as string).trim()
            }
            path.push(k)
            return ''
        })
        let value: any = data
        let index = 0
        const length = path.length
        while (isValid(value) && index < length) {
            value = value?.[path[index++]]
        }
        return isValid(value) ? value : (defaultValue ?? '--')
    }
    return defaultValue ?? '--'
}

function getVolumeFigure(): IndicatorFigure<Vol> {
    return {
        key: 'volume',
        title: 'VOLUME: ',
        type: 'bar',
        baseValue: 0,
        styles: ({ data, indicator, defaultStyles }) => {
            const current = data.current
            let color = formatValue(indicator.styles, 'bars[0].noChangeColor', (defaultStyles!.bars)[0].noChangeColor)
            if (isValid(current)) {
                if (current.close > current.open) {
                    color = formatValue(indicator.styles, 'bars[0].upColor', (defaultStyles!.bars)[0].upColor)
                } else if (current.close < current.open) {
                    color = formatValue(indicator.styles, 'bars[0].downColor', (defaultStyles!.bars)[0].downColor)
                }
            }
            return { color: color as string }
        }
    }
}

export const volume: IndicatorTemplate<Vol, number> = {
    name: 'MYVOL',
    shortName: 'VOL',
    series: IndicatorSeries.Volume,
    calcParams: [5, 144],
    shouldFormatBigNumber: true,
    precision: 0,
    minValue: 0,
    figures: [
        { key: 'ma1', title: 'MA5: ', type: 'line' },
        { key: 'ma2', title: 'MA144: ', type: 'line' },
        getVolumeFigure()
    ],
    regenerateFigures: (params) => {
        const figures: Array<IndicatorFigure<Vol>> = params.map((p, i) => ({ key: `ma${i + 1}`, title: `MA${p}: `, type: 'line' }))
        figures.push(getVolumeFigure())
        return figures
    },
    calc: (dataList, indicator) => {
        const { calcParams: params, figures } = indicator
        const volSums: number[] = []
        return dataList.map((kLineData, i) => {
            const volume = kLineData.volume ?? 0
            const vol: Vol = { volume, open: kLineData.open, close: kLineData.close }
            params.forEach((p, index) => {
                volSums[index] = (volSums[index] ?? 0) + volume
                if (i >= p - 1) {
                    // @ts-ignore
                    vol[figures[index].key] = volSums[index] / p
                    volSums[index] -= (dataList[i - (p - 1)].volume ?? 0)
                }
            })
            return vol
        })
    }
}