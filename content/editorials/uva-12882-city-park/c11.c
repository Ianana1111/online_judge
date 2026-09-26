#include <stdio.h>
#include <stdlib.h>
typedef struct{long long line,begin,end;int id;} Side;
int *parent,*size;long long *area;
int find(int a){while(parent[a]!=a){parent[a]=parent[parent[a]];a=parent[a];}return a;}
void join(int a,int b){a=find(a);b=find(b);if(a==b)return;if(size[a]<size[b]){int t=a;a=b;b=t;}parent[b]=a;size[a]+=size[b];area[a]+=area[b];}
int compare(const void *left,const void *right){
    const Side*a=(const Side*)left,*b=(const Side*)right;
    if(a->line!=b->line)return a->line<b->line?-1:1;
    if(a->begin!=b->begin)return a->begin<b->begin?-1:1;
    if(a->end!=b->end)return a->end<b->end?-1:1;return a->id-b->id;
}
void connect(Side*sides,int count){
    qsort(sides,count,sizeof(Side),compare);long long line=0,end=0;int representative=-1;
    for(int i=0;i<count;i++){
        Side side=sides[i];
        if(representative>=0&&side.line==line&&side.begin<=end){join(representative,side.id);if(side.end>end){end=side.end;representative=side.id;}}
        else{line=side.line;end=side.end;representative=side.id;}
    }
}
int main(void){
    int n;
    while(scanf("%d",&n)==1){
        parent=(int*)malloc(n*sizeof(int));size=(int*)malloc(n*sizeof(int));area=(long long*)malloc(n*sizeof(long long));
        Side*vertical=(Side*)malloc(2*n*sizeof(Side)),*horizontal=(Side*)malloc(2*n*sizeof(Side));
        for(int i=0;i<n;i++){
            long long x,y,w,h;scanf("%lld%lld%lld%lld",&x,&y,&w,&h);parent[i]=i;size[i]=1;area[i]=w*h;
            vertical[2*i]=(Side){x,y,y+h,i};vertical[2*i+1]=(Side){x+w,y,y+h,i};
            horizontal[2*i]=(Side){y,x,x+w,i};horizontal[2*i+1]=(Side){y+h,x,x+w,i};
        }
        connect(vertical,2*n);connect(horizontal,2*n);long long answer=0;
        for(int i=0;i<n;i++){long long value=area[find(i)];if(value>answer)answer=value;}printf("%lld\n",answer);
        free(parent);free(size);free(area);free(vertical);free(horizontal);
    }
    return 0;
}
