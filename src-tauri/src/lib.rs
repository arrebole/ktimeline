mod tdx;

// 获取上证指数的数据
#[tauri::command]
fn find_klines(code: &str) -> String {
    return tdx::read_lday(code);
}

// 获取笔记的列表
#[tauri::command]
fn find_note_list(code: &str) -> String {
    "hello".to_string()
}

// 获取笔记的数据
#[tauri::command]
fn find_note_content(code: &str) -> String {
    "hello".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(
            tauri::generate_handler![
                find_klines,
                find_note_list,
                find_note_content
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
