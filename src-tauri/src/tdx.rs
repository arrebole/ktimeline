use std::fs;

const ROOT_PATH: &str = ".";

// 解析tdx离线数据
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
pub fn read_timeline() -> String {
    let path = format!("{}/index.csv", ROOT_PATH);
    let contents = fs::read_to_string(&path).unwrap();
    return contents;
}