#include <algorithm>
#include <iostream>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int rows,columns;
    while(cin>>rows>>columns && (rows||columns)){
        int shorter=min(rows,columns),longer=max(rows,columns),answer;
        if(shorter==0)answer=0;
        else if(shorter==1)answer=longer;
        else if(shorter==2)answer=4*(longer/4)+min(4,2*(longer%4));
        else answer=(rows*columns+1)/2;
        cout<<answer<<" knights may be placed on a "<<rows<<" row "<<columns<<" column board.\n";
    }
}
