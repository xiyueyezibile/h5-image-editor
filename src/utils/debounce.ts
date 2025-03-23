/**
 * debounce.ts
 * 防抖函数工具
 * 用于限制函数的执行频率，在一定时间内多次调用只执行最后一次
 * 
 * @param fn 需要进行防抖处理的函数
 * @param delay 防抖延迟时间（毫秒）
 * @returns 经过防抖处理的新函数
 * 
 * @example
 * // 使用示例：
 * const debouncedResize = debounce(() => {
 *   // 处理窗口调整大小的逻辑
 * }, 200);
 * window.addEventListener('resize', debouncedResize);
 */
export const debounce = (fn: Function, delay: number) => {
    let timer: number;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), delay);
    };
  };