import { invoke } from "@tauri-apps/api/core";
import dayjs from "dayjs";

export interface CoreDriver {
    timestamp: number;
    date: string;
    environment: string;
    block: string;
    event: string;
    leader: string[];
    active: string[];
    ready: string[];
    starts: string[];
}

function convertToTimestamp(dateStr: string) {
    if (dateStr.includes("-")) {
        console.log(dateStr)
        return dayjs(dateStr).unix() * 1000;
    }

    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);

    // 获取时间戳
    return dayjs(`${year}-${month}-${day}`).unix() * 1000;
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

export async function fetchTimelines(): Promise<CoreDriver[]> {
    const content: string = await invoke("find_timeline");
    return content
        .split("\n")
        .filter((_, i) => i != 0)
        .map(v => v.split(","))
        .map(rows => ({
            timestamp: convertToTimestamp(rows[0]),
            date: rows[0],
            environment: rows[1],
            block: rows[2],
            event: rows[3],
            leader: rows[4].split("、"),
            active: rows[5].split("、"),
            ready: rows[6].split("、"),
            starts: rows[7].split("、"),
        }));
}
