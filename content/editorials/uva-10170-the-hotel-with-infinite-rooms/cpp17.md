through lambda 捕捉當前 start，計算從該團開始到 size 的完整等差和。兩個乘數都是 long long，中間乘積不會先落入窄整數。

若 through(mid) 已達 day，答案仍可能更早，因此 high=mid；否則 mid 一定太早，low=mid+1。區間使用包含式，下界從合法最小團體 start 開始。當 day≤start 時會收斂回 start，單一團內的全部日期都能正確涵蓋。
