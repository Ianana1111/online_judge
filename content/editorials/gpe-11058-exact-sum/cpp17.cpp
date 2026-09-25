#include <algorithm>
#include <iomanip>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n) {
        vector<long long> prices(n); for (auto &price : prices) cin >> price;
        long long money; cin >> money; sort(prices.begin(),prices.end());
        int left = 0, right = n - 1; long long first = 0, second = 0;
        while (left < right) {
            long long sum = prices[left] + prices[right];
            if (sum < money) ++left;
            else if (sum > money) --right;
            else { first = prices[left]; second = prices[right]; ++left; --right; }
        }
        cout << "Peter should buy books whose prices are " << first << " and " << second << ".\n\n";
    }
}
