#include <array>
#include <iomanip>
#include <iostream>
#include <vector>
using namespace std;
struct Request { int source,start,duration,target; };
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests; cout << "CALL FORWARDING OUTPUT\n";
    for (int system = 1; system <= tests; ++system) {
        vector<Request> requests; int source;
        while (cin >> source && source) { Request request; request.source = source; cin >> request.start >> request.duration >> request.target; requests.push_back(request); }
        cout << "SYSTEM " << system << '\n'; int time,extension;
        while (cin >> time && time != 9000) {
            cin >> extension; int current = extension; array<bool,10000> seen{};
            while (true) {
                if (seen[current]) { current = 9999; break; }
                seen[current] = true; int next = -1;
                for (const auto &request : requests) if (request.source == current && request.start <= time && time <= request.start + request.duration) { next = request.target; break; }
                if (next == -1) break;
                current = next;
            }
            cout << "AT " << setfill('0') << setw(4) << time << " CALL TO " << setw(4) << extension << " RINGS " << setw(4) << current << '\n';
        }
    }
    cout << "END OF OUTPUT\n";
}
