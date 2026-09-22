#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int rate[5][3] = {
        {10, 6, 2}, {25, 15, 5}, {53, 33, 13},
        {87, 47, 17}, {144, 80, 30}
    };
    char step;
    while (cin >> step && step != '#') {
        string phone;
        int sh, sm, eh, em;
        cin >> phone >> sh >> sm >> eh >> em;
        int start = sh * 60 + sm, finish = eh * 60 + em;
        if (finish <= start) finish += 24 * 60;
        int minutes[3] = {0, 0, 0};
        for (int t = start; t < finish; ++t) {
            int clockMinute = t % (24 * 60);
            int period = (clockMinute >= 480 && clockMinute < 1080) ? 0
                       : (clockMinute >= 1080 && clockMinute < 1320) ? 1 : 2;
            ++minutes[period];
        }
        int cents = 0;
        for (int i = 0; i < 3; ++i) cents += minutes[i] * rate[step - 'A'][i];
        string price = to_string(cents / 100) + "."
                     + (cents % 100 < 10 ? "0" : "") + to_string(cents % 100);
        cout << setw(10) << phone
             << setw(6) << minutes[0] << setw(6) << minutes[1]
             << setw(6) << minutes[2] << setw(3) << step << setw(8) << price << '\n';
    }
}
