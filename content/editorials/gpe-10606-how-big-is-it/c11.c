#include <stdio.h>
#include <stdlib.h>
#include <math.h>
int n,order[8],used[8];double radius[8],gap[8][8],position[8],best;
int compare(const void *a,const void *b){double x=*(const double*)a,y=*(const double*)b;return (x>y)-(x<y);}
void search(int count,double width){
    if(width>=best)return;
    if(count==n){best=width;return;}
    for(int i=0;i<n;i++){
        if(used[i]||(i>0&&radius[i]==radius[i-1]&&!used[i-1]))continue;
        double center=radius[i];
        for(int j=0;j<count;j++){double required=position[j]+gap[i][order[j]];if(required>center)center=required;}
        used[i]=1;order[count]=i;position[count]=center;
        double next=center+radius[i];search(count+1,next>width?next:width);used[i]=0;
    }
}
int main(void){
    int tests;scanf("%d",&tests);
    while(tests--){
        scanf("%d",&n);best=0;
        for(int i=0;i<n;i++){scanf("%lf",&radius[i]);best+=2*radius[i];used[i]=0;}
        qsort(radius,n,sizeof(double),compare);
        for(int i=0;i<n;i++)for(int j=0;j<n;j++)gap[i][j]=2*sqrt(radius[i]*radius[j]);
        search(0,0);printf("%.3f\n",best);
    }
    return 0;
}
