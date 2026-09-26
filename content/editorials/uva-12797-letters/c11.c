#include <stdio.h>
#include <limits.h>
int main(void){
    int n;
    while(scanf("%d",&n)==1){
        int letter[10000],upper[10000],distance[10000],queue[10000];char line[101];
        for(int r=0;r<n;r++){scanf("%100s",line);for(int c=0;c<n;c++){int at=r*n+c;upper[at]=line[c]>='A'&&line[c]<='J';letter[at]=line[c]-(upper[at]?'A':'a');}}
        int answer=INT_MAX;
        for(int mask=0;mask<1024;mask++){
            if(((mask>>letter[0])&1)!=upper[0]||((mask>>letter[n*n-1])&1)!=upper[n*n-1])continue;
            for(int i=0;i<n*n;i++)distance[i]=-1;
            int front=0,back=0;queue[back++]=0;distance[0]=1;
            while(front<back){
                int at=queue[front++];if(at==n*n-1){if(distance[at]<answer)answer=distance[at];break;}
                int r=at/n,c=at%n,dr[4]={-1,1,0,0},dc[4]={0,0,-1,1};
                for(int direction=0;direction<4;direction++){
                    int rr=r+dr[direction],cc=c+dc[direction];if(rr<0||rr>=n||cc<0||cc>=n)continue;
                    int next=rr*n+cc;
                    if(distance[next]>=0||((mask>>letter[next])&1)!=upper[next])continue;
                    distance[next]=distance[at]+1;queue[back++]=next;
                }
            }
            if(answer==2*n-1)break;
        }
        printf("%d\n",answer==INT_MAX?-1:answer);
    }
    return 0;
}
