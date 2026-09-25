#include <algorithm>
#include <cctype>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n,tc=0;string line;
    while(cin >> n && n) {
        getline(cin,line);vector<string> screen(10,string(10,' '));int row=0,col=0;bool insert=false;
        for(int j=0;j<n;++j) {
            getline(cin,line);
            for(size_t at=0;at<line.size();++at) {
                char ch=line[at];
                if(ch=='^') {
                    char command=line[++at];
                    if(isdigit((unsigned char)command)){row=command-'0';col=line[++at]-'0';continue;}
                    if(command=='b')col=0;
                    else if(command=='c')screen.assign(10,string(10,' '));
                    else if(command=='d')row=min(9,row+1);
                    else if(command=='e')for(int c=col;c<10;++c)screen[row][c]=' ';
                    else if(command=='h')row=col=0;
                    else if(command=='i')insert=true;
                    else if(command=='l')col=max(0,col-1);
                    else if(command=='o')insert=false;
                    else if(command=='r')col=min(9,col+1);
                    else if(command=='u')row=max(0,row-1);
                    if(command!='^')continue;
                    ch='^';
                }
                if(insert)for(int c=9;c>col;--c)screen[row][c]=screen[row][c-1];
                screen[row][col]=ch;col=min(9,col+1);
            }
        }
        cout << "Case " << ++tc << "\n+----------+\n";
        for(const string &row:screen)cout << '|' << row << "|\n";
        cout << "+----------+\n";
    }
}
