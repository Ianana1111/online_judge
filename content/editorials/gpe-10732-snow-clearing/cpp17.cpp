#include <cmath>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);string line;getline(cin,line);int tests=stoi(line);
    for(int test=0;test<tests;++test){
        while(getline(cin,line)&&line.find_first_not_of(" \t\r")==string::npos){}
        long double hx,hy;istringstream hangar(line);hangar>>hx>>hy;long double length=0;
        while(getline(cin,line)&&line.find_first_not_of(" \t\r")!=string::npos){
            long double x1,y1,x2,y2;istringstream street(line);street>>x1>>y1>>x2>>y2;
            length+=hypotl(x2-x1,y2-y1);
        }
        long double minutes=length*6/1000;
        long long rounded=(long long)floorl(minutes+0.5L);
        if(test)cout<<'\n';cout<<rounded/60<<':'<<setw(2)<<setfill('0')<<rounded%60<<setfill(' ')<<'\n';
    }
}
