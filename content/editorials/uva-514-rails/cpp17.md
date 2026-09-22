target 先保存整筆資料，station 和 next 都在每筆查詢重新建立。while 的短路條件先判 empty，再讀 back，因此空堆疊時不會存取非法位置。next++ 保證車號只按升序進站且每節一次。

無法匹配堆頂時設 possible=false 並離開模擬迴圈；因為 target 已全部讀入，外層讀取位置仍正確。成功匹配才 pop_back，不會錯刪中間車廂。first=0 只結束目前 N 的查詢，外層還會讀下一個 N。
