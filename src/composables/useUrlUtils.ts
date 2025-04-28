/**
 * 根据图片URL转为File对象
 * @param url 图片地址
 * @param filename 文件名（可选，默认从url提取）
 * @returns Promise<File>
 */
export async function urlToFile(url: string, filename?: string): Promise<File> {
    const res = await fetch(url)
    const blob = await res.blob()
    // 自动推断文件名
    const name = filename || url.split('/').pop() || 'file'
    // 可根据实际情况设置类型
    return new File([blob], name, { type: blob.type })
}