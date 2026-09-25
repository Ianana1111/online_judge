#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const vector<string> months = {"pop","no","zip","zotz","tzec","xul","yoxkin","mol","chen","yax","zac","ceh","mac","kankin","muan","pax","koyab","cumhu","uayet"};
    const vector<string> names = {"imix","ik","akbal","kan","chicchan","cimi","manik","lamat","muluk","ok","chuen","eb","ben","ix","mem","cib","caban","eznab","canac","ahau"};
    int tests; cin >> tests; cout << tests << '\n';
    while (tests--) {
        int day, year; char dot; string month; cin >> day >> dot >> month >> year;
        int monthIndex = find(months.begin(), months.end(), month) - months.begin();
        int elapsed = year * 365 + monthIndex * 20 + day;
        cout << elapsed % 13 + 1 << ' ' << names[elapsed % 20] << ' ' << elapsed / 260 << '\n';
    }
}
