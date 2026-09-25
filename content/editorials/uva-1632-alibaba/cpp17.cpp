#include <algorithm>
#include <iomanip>
#include <iostream>
#include <vector>
using namespace std;
long long earliest(long long a,long long b){if(a<0)return b;if(b<0)return a;return min(a,b);}
long long arrive(long long time,__int128 distance,long long deadline){
    if(time<0)return -1;
    __int128 candidate=(__int128)time+distance;
    return candidate < deadline ? (long long)candidate : -1;
}
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n;
    while(cin>>n){
        vector<long long> position(n),deadline(n),left(n),right(n);
        for(int i=0;i<n;++i){cin>>position[i]>>deadline[i];left[i]=right[i]=deadline[i]>0?0:-1;}
        for(int length=2;length<=n;++length){
            for(int l=0;l+length<=n;++l){
                int r=l+length-1;
                __int128 span=(__int128)position[r]-position[l];
                long long nextLeft=earliest(
                    arrive(left[l+1],(__int128)position[l+1]-position[l],deadline[l]),
                    arrive(right[l+1],span,deadline[l]));
                long long nextRight=earliest(
                    arrive(left[l],span,deadline[r]),
                    arrive(right[l],(__int128)position[r]-position[r-1],deadline[r]));
                left[l]=nextLeft;right[l]=nextRight;
            }
        }
        long long answer=earliest(left[0],right[0]);
        if(answer<0)cout<<"No solution\n";else cout<<answer<<'\n';
    }
}
