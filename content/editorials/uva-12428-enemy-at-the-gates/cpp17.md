n、m、excess、mid 全部使用 long long，乘積在轉型前就已是寬整數。excess 是相對於連通樹的額外邊，而非 m 本身；這讓樹與含環圖可以用相同搜尋處理。

搜尋區間從一到 n。mid 已可容納全部 excess 時，答案可能還能更小，因此 high=mid；否則 low=mid+1。公式在 k=1、2 都為零，對非負 excess 仍保持單調。迴圈停止時 low 是第一個可行核心大小，印 n-low 即是能留在核心外的橋數。
