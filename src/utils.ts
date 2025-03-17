
export function debounce(func: Function, wait: number, immediate: boolean) {
    let timeout: number | undefined;
    return function (...args: any) {
        // @ts-ignore
        const context: any = this;
        if (immediate && !timeout) {
            func.apply(context, args); // 立即执行
        }
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            // 重置 timeout
            timeout = undefined; 
            if (!immediate) {
                // 延迟执行
                func.apply(context, args); 
            }
        }, wait);
    };
}