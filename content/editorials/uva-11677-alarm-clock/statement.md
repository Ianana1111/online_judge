Daniela is a nurse in a large hospital, which causes her working shifts to constantly change. To make
it worse, she has deep sleep, and a difficult time to wake up using alarm clocks.
Recently she got a digital clock as a gift, with several different options of alarm sounds, and she has
hope that it might help solve her problem. But, lately, she’s been very tired and want to enjoy every
single moment of rest. So she carries her new clock to every place she goes, and whenever she has some
spare time, she tries to sleep, setting her alarm clock to the time when she needs to wake up. But, with
so much anxiety to sleep, she ends up with some difficulty to fall asleep and enjoy some rest.

A problem that has been tormenting her is to know how many minutes of sleep she would have if
she felt asleep immediately and woken up when the alarm clock ringed. But she is not very good with
numbers, and asked you for help to write a program that, given the current time and the alarm time,
find out the number of minutes she could sleep.

### Input

The input contains several test cases. Each test case is described in one line, containing four integers H<sub>1</sub>,
M<sub>1</sub>, H<sub>2</sub> and M<sub>2</sub>, with H<sub>1</sub> : M<sub>1</sub> representing the current hour and minute, and H<sub>2</sub> : M<sub>2</sub> representing the
time (hour and minute) when the alarm clock is set to ring (0 ≤ H<sub>1</sub> ≤ 23, 0 ≤ M<sub>1</sub> ≤ 59, 0 ≤ H<sub>2</sub> ≤ 23,
0 ≤ M<sub>2</sub> ≤ 59).

The end of the input is indicated by a line containing only four zeros, separated by blank spaces.

### Output

For each test case, your program must print one line, containing a single integer, indicating the number
of minutes Daniela has to sleep.

### 本平台判定約定

若目前時間與鬧鐘時間相同，且不是四個零的結束標記，視為設定在隔天同一時間，答案為 1440 分鐘。此處明確保留本站既有測資的判定規則；原始題面沒有另外說明相同時刻的處理方式。
