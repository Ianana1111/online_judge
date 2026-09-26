#include <stdio.h>
#include <stdlib.h>
int *parent;
int root(int x){int r=x;while(parent[r]!=r)r=parent[r];while(parent[x]!=x){int next=parent[x];parent[x]=r;x=next;}return r;}
int main(void){
    int n,m;
    while(scanf("%d%d",&n,&m)==2){
        int capacity=n+m+1,used=n;
        parent=malloc(capacity*sizeof(int));
        int *size=calloc(capacity,sizeof(int)),*weight=malloc(capacity*sizeof(int)),*id=malloc((n+1)*sizeof(int));
        long long *sum=calloc(capacity,sizeof(long long));
        for(int p=0;p<capacity;p++){parent[p]=p;weight[p]=1;}
        for(int p=1;p<=n;p++){id[p]=p;size[p]=1;sum[p]=p;}
        for(int i=0;i<m;i++){
            int op,p,q;scanf("%d%d",&op,&p);int a=root(id[p]);
            if(op==3){printf("%d %lld\n",size[a],sum[a]);continue;}
            scanf("%d",&q);int b=root(id[q]);if(a==b)continue;
            if(op==1){
                if(weight[a]<weight[b]){int temp=a;a=b;b=temp;}
                parent[b]=a;weight[a]+=weight[b];size[a]+=size[b];sum[a]+=sum[b];
            }else{
                size[a]--;sum[a]-=p;size[b]++;sum[b]+=p;
                id[p]=++used;parent[used]=b;weight[b]++;
            }
        }
        free(parent);free(size);free(weight);free(id);free(sum);
    }
    return 0;
}
