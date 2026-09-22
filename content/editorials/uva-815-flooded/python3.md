remaining 始終保存尚未用來填滿完整高度層的水量，level 保存最近填平的高度，count 是已納入前綴的格數。相同高度需要零體積，会直接納入，不影響剩餘水。遇到 volume>remaining 才停止，等號仍可升到下一層。

numerator/denominator 表示最終精確水位，submerged 重新掃描每一格，用整數乘法比較，不使用 count 或已格式化的文字判斷。百分比把格數乘一百后除總格數，每組印指定三行與空白行。fixed_ratio 也能處理負水位，輸出仍固定兩位小數。
