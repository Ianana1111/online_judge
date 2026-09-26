#include <stdio.h>
#include <string.h>
int capacity[42][42],level[42],next[42],vertices,sink;
int layers(int source){
    for(int i=0;i<vertices;i++)level[i]=-1;int queue[42],front=0,back=0;queue[back++]=source;level[source]=0;
    while(front<back){int u=queue[front++];for(int v=0;v<vertices;v++)if(capacity[u][v]>0&&level[v]<0){level[v]=level[u]+1;queue[back++]=v;}}
    return level[sink]>=0;
}
int send(int u,int amount){
    if(u==sink)return amount;
    for(;next[u]<vertices;next[u]++){
        int v=next[u];if(capacity[u][v]<=0||level[v]!=level[u]+1)continue;
        int available=capacity[u][v]<amount?capacity[u][v]:amount,pushed=send(v,available);
        if(pushed){capacity[u][v]-=pushed;capacity[v][u]+=pushed;return pushed;}
    }
    return 0;
}
int main(void){
    int tests;scanf("%d",&tests);
    for(int test=1;test<=tests;test++){
        int rows,columns;scanf("%d%d",&rows,&columns);int source=rows+columns;sink=source+1;vertices=sink+1;memset(capacity,0,sizeof(capacity));
        int previous=0;
        for(int i=0;i<rows;i++){int cumulative;scanf("%d",&cumulative);capacity[source][i]=cumulative-previous-columns;previous=cumulative;for(int j=0;j<columns;j++)capacity[i][rows+j]=19;}
        previous=0;
        for(int j=0;j<columns;j++){int cumulative;scanf("%d",&cumulative);capacity[rows+j][sink]=cumulative-previous-rows;previous=cumulative;}
        while(layers(source)){memset(next,0,sizeof(next));while(send(source,8000)){};}
        if(test>1)putchar('\n');printf("Matrix %d\n",test);
        for(int i=0;i<rows;i++){for(int j=0;j<columns;j++){if(j)putchar(' ');printf("%d",20-capacity[i][rows+j]);}putchar('\n');}
    }
    return 0;
}
