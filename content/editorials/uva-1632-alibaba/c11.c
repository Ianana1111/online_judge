#include <stdio.h>
#include <stdlib.h>
long long earliest(long long a,long long b){if(a<0)return b;if(b<0)return a;return a<b?a:b;}
long long arrive(long long time,__int128 distance,long long deadline){if(time<0)return -1;__int128 candidate=(__int128)time+distance;return candidate<deadline?(long long)candidate:-1;}
int main(void){
    int n;
    while(scanf("%d",&n)==1){
        long long *position=(long long*)malloc(n*sizeof(long long)),*deadline=(long long*)malloc(n*sizeof(long long)),*left=(long long*)malloc(n*sizeof(long long)),*right=(long long*)malloc(n*sizeof(long long));
        for(int i=0;i<n;i++){scanf("%lld%lld",&position[i],&deadline[i]);left[i]=right[i]=deadline[i]>0?0:-1;}
        for(int length=2;length<=n;length++)for(int l=0;l+length<=n;l++){
            int r=l+length-1;__int128 span=(__int128)position[r]-position[l];
            long long next_left=earliest(arrive(left[l+1],(__int128)position[l+1]-position[l],deadline[l]),arrive(right[l+1],span,deadline[l]));
            long long next_right=earliest(arrive(left[l],span,deadline[r]),arrive(right[l],(__int128)position[r]-position[r-1],deadline[r]));
            left[l]=next_left;right[l]=next_right;
        }
        long long answer=earliest(left[0],right[0]);if(answer<0)puts("No solution");else printf("%lld\n",answer);
        free(position);free(deadline);free(left);free(right);
    }
    return 0;
}
