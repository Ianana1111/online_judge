flush lambda 負責反轉、輸出、清空三個連續操作，避免在分隔符與 EOF 兩處寫出不同邏輯。它捕捉 word 的參考，每次作用在目前尚未輸出的區段。

isspace 的參數先轉 unsigned char，避免 char 在某些平台為有號型別時傳入負值。分隔符在 flush 後立即輸出，所以不會進入被反轉的 word。最後的 flush 是必要步驟，即使輸入沒有最末換行也能完整處理。
