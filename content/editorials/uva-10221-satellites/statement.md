The radius of earth is 6440 Kilometer. There are many Satellites
and Asteroids moving around the earth. If two Satellites create
an angle with the center of earth, can you find out the distance
between them? By distance we mean both the arc and chord
distances. Both satellites are on the same orbit (However, please
consider that they are revolving on a circular path rather than
an elliptical path).

![Diagram of Earth (E) and two satellite positions with angle a, radius r, and distance s](/problem-images/uva-10221-satellites.png)

### Input

The input file will contain one or more test cases.

Each test case consists of one line containing two-integer s
and a, and a string ‘min’ or ‘deg’. Here s is the distance of the
satellite from the surface of the earth and a is the angle that the
satellites make with the center of earth. It may be in minutes (′) or in degrees (◦). Remember that the
same line will never contain minute and degree at a time.

### Output

For each test case, print one line containing the required distances i.e. both arc distance and chord
distance respectively between two satellites in Kilometer. The distance will be a floating-point value
with six digits after decimal point.


### 本站距離定義

弧長指兩顆衛星之間的較短圓弧。將角度換算為度並化至一圈後，若超過 180 度，使用 `360 − 角度`；弦長則為兩點間的直線距離。角分 `min` 為六十分之一度，完整一圈表示兩點重合。
