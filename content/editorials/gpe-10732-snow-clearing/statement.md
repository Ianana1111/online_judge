As the days become shorter and the nights become longer
we turn our thoughts to snow clearing. Due to budget cuts,
the Big Noisy City has exactly one snow plow. The plow
can clear exactly one lane of a road in a single pass. Whenever there is snow on the ground, the plow departs from its
hangar and tours the city, plowing as it goes. What is the
minimum time that the plow needs to clear every lane of
every road?

### Input

The first line of input is the number of test cases, followed
by a blank line.

Then, for each test case, the first line of input contains two integers: the x, y coordinates of the
hangar (in metres). Up to 100 lines follow. Each gives the coordinates (in metres) of the beginning and
end of a street. All roads are perfectly straight, with one lane in each direction. The plow can turn
any direction (including a U-turn) at any intersection, and can turn around at the end of any street.
The plow travels at 20 km/h if it is plowing, and 50 km/h if the lane it is driving on has already been
plowed. It is possible to reach all streets from the hangar.

There is a blank line between each consecutive test cases.

### Output

For each test case, your output should be the time, in hours and minutes, required to clear the streets
and return to the hangar. Round to the nearest minute.

Print a blank line between 2 consecutive test cases.

### 本站評測規格

每份輸入最多 100 組，每組仍保留原題最多 100 條街道。車庫與道路端點均為絕對值不超過 1,000,000,000 的整數座標；所有街道可由車庫經道路到達（包含線段交點）。時間取最近整分鐘，剛好半分鐘時兩個等距的整分鐘皆可接受。
