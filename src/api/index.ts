import { invoke } from "@tauri-apps/api/core";
import { RTFJS } from 'rtf.js';
RTFJS.loggingEnabled(false);

export interface IndexItem {
    timestamp: number;
    symbol: string;
}

function convertToTimestamp(dateStr: string) {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    // 使用东八区时间
    const date = new Date(`${year}-${month}-${day}T00:00:00+08:00`);
    // 获取时间戳
    return date.getTime();
}

export async function fetchKlineData() {
    const content: string = await invoke("find_klines", {
        code: "sh999999"
    });

    return content
        .split("\n")
        .filter(l => l.length > 0)
        .map(v => v.split(" "))
        .map((rows) => (
            {
                timestamp: convertToTimestamp(rows[0]),
                open: +rows[1] / 100,
                high: +rows[2] / 100,
                low: +rows[3] / 100,
                close: +rows[4] / 100,
                volume: +rows[6],
            }
        ));
}

export async function fetchIndex(): Promise<IndexItem[]> {
    const content: string = await invoke("find_index");
    return content
        .split("\n")
        .filter(v => v.length > 0)
        .map(v => v.split(" "))
        .map(rows => ({
            timestamp: convertToTimestamp(rows[0]),
            symbol: rows[1],
        }));
}

export async function updateIndex(date: string, symbol: string): Promise<string> {
    console.log("update", date, symbol);
    return await invoke("update_index", {
        date,
        symbol,
    });
}

/**
 * 将字符串转化为字节码
 */
function stringToArrayBuffer(str: string) {
    const buffer = new ArrayBuffer(str.length);
    const bufferView = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
        bufferView[i] = str.charCodeAt(i);
    }
    return buffer;
}

/**
 * 提取rtf中的文本
 */
async function rtfparse(rtf: string) {
    const doc = new RTFJS.Document(
        stringToArrayBuffer(rtf),
        {}
    );
    return doc.render();
}

/**
 * 检查其颜色是否为黑色，并将其更改为白色
 */
function traverseAndChangeColor(element: HTMLElement): void {
    // 获取元素的颜色
    const color = element.style.color;
    // 检查颜色是否为黑色
    if (color === 'rgb(0, 0, 0)' || color === '#000000' || color === 'black') {
        element.style.color = '#dddddd'; // 更改为白色
    }
    // 递归遍历所有子元素
    for (let child of element.children) {
        traverseAndChangeColor(child as HTMLElement);
    }
}

function changeBlackToWhite(elements: HTMLElement[]) {
    // 获取容器内的所有元素
    elements.forEach((element) => {
        traverseAndChangeColor(element);
    });
    return elements;
};


/**
 * 获取指定日期的笔记文件
 */
export async function fetchNoteContent(date: string) {
    const rtf: string = await invoke("find_note_content", {
        date
    });
    if (rtf && rtf.length > 0) {
        return changeBlackToWhite(await rtfparse(rtf));
    }
    return [];
}

