diameter 直接以兩端中點建立圓，第三個欄位保存到端點的距離平方。outside 比較精確距離平方，點在圓上時回傳 false。through_three 先平移讓 a 成為原點，解兩條垂直平分線；determinant 為零才走共線分支，選三組直徑圓中半徑最大的。

minimum_circle 的 i、j、k 三層分別固定新出界的第一、第二、第三個邊界點，只有外點才觸發重建。輸入半徑不先經過 float，避免十進位界線已在解析時失真。最終 possible 用≤比較 squared 與 radius²，輸出題目指定完整句子及句點。
