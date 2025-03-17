use std::fs;
use serde::{Deserialize, Serialize};

const ROOT_PATH: &str = ".";

// 索引标记结构
#[derive(Debug, Deserialize, Serialize)]
struct IndexItem {
    date: String,
    symbol: String,
}

fn parse_buffer(buf: &[u8]) -> String {
    let date = u32::from_le_bytes(buf[0..4].try_into().unwrap());
    let open = u32::from_le_bytes(buf[4..8].try_into().unwrap());
    let high = u32::from_le_bytes(buf[8..12].try_into().unwrap());
    let low = u32::from_le_bytes(buf[12..16].try_into().unwrap());
    let close = u32::from_le_bytes(buf[16..20].try_into().unwrap());
    let amount = u32::from_le_bytes(buf[20..24].try_into().unwrap());
    let volume = u32::from_le_bytes(buf[24..28].try_into().unwrap());
    return format!(
        "{} {} {} {} {} {} {}\n",
        date, open, high, low, close, amount, volume
    );
}

// 读取日线数据
pub fn read_lday(code: &str) -> String {
    let market = &code[0..=1];

    let file_path = format!(
        "{ROOT_PATH}/../../vipdoc/{market}/lday/{code}.day"
    );

    let buf = fs::read(file_path)
    .expect("Should have been able to read the file");

    // 计算行数
    let num = buf.len();
    let no = num / 32;

    // 解析并写入文件
    let mut b = 0;
    let mut e = 32;

    let mut result = String::new();
    for _ in 0..no {
        let line = parse_buffer(&buf[b..e]);
        result = result + &line;
        b += 32;
        e += 32;
    }
    return result;
}

// 读取索引，获取日期事件标记
pub fn read_index() -> String {
    // 读取 .yaml 文件
    let path = format!("{}/index.yaml", ROOT_PATH);
    let contents = fs::read_to_string(&path).unwrap();

    let mut result = String::new();
    let items: Vec<IndexItem> = serde_yaml::from_str(&contents).unwrap();
    for v in items {
        result += &format!("{} {}\n", v.date, v.symbol);
    }
    return result;
}

// 更新索引标记
pub fn update_index(date: &str, symbol: &str) -> String {
    // 读取yaml内容
    let path = format!("{}/index.yaml", ROOT_PATH);
    let contents = fs::read_to_string(&path).unwrap();

    // 2. 解析 YAML 文件为 Rust 数据结构
    let mut items: Vec<IndexItem>  = serde_yaml::from_str(&contents).unwrap();

    // 3. 修改数据
    let mut update = false;
    for value in items.iter_mut() {
        if value.date == date {
            value.symbol = symbol.to_string();
            update = true;
            break;
        }
    }
    if !update {
        items.push(IndexItem{ 
            date: date.to_string(), 
            symbol: symbol.to_string()
        });
    }

    // 4. 将修改后的数据序列化为 YAML 字符串
    let new_contents = serde_yaml::to_string(&items)
        .unwrap()
        .replace("'", "");

    // 5. 写回文件
    fs::write(path, new_contents).unwrap();

    return symbol.to_string();
}

// 读取指定日期的笔记内容
pub fn read_note_content(date: &str) -> String {
    let path = format!("{}/默认分区/{}.cic", ROOT_PATH, date);
    let result = fs::read_to_string(&path);
    if result.is_ok() {
        return result.unwrap();
    }
    return String::new();
}