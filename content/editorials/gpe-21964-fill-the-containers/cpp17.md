low 在讀取時累積最大瓶量，high 累積總量，建立了每次 feasible 所需的單瓶不超界前提。current 保存當前容器負載，新容器開啟後先清零，再倒入這一瓶，避免漏掉觸發換容器的瓶子。

feasible 只回傳使用數是否至多 containers。主迴圈若 mid 可行就保留 mid 作為上界，否則最小答案至少 mid+1；low<high 保證每次區間縮小。最後 low、high 相等，輸出這個容量，不需要另外保存分段方案。
