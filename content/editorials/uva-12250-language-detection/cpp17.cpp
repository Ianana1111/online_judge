#include <algorithm>
#include <iostream>
#include <map>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const map<string, string> languages = {{"HELLO","ENGLISH"},{"HOLA","SPANISH"},{"HALLO","GERMAN"},{"BONJOUR","FRENCH"},{"CIAO","ITALIAN"},{"ZDRAVSTVUJTE","RUSSIAN"}};
    string word; int tc = 0;
    while (cin >> word && word != "#") {
        auto found = languages.find(word);
        cout << "Case " << ++tc << ": " << (found == languages.end() ? "UNKNOWN" : found->second) << '\n';
    }
}
