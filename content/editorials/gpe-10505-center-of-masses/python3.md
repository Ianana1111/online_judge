compare 以 n*x−sum_x、n*y−sum_y 表示對平均中心的向量，保持整數。half 把負 y 與負 x 軸放到後半圈；同半圈 cross>0 代表 a 在 b 前面，不依赖浮點角度。

排序後逐邊累加 area、moment_x、moment_y。area 是二倍面積，直接用 3*area 作分母即可，不能先除二造成半整數面積丟失。fixed_ratio 支援正負分子分母，半向離零捨入且把零正規化。主程式在 count<3 時先停止，符合終止標記不附座標的輸入。
