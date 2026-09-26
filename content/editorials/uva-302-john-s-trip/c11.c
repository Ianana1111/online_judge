#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef struct{int id,to;} Edge;
Edge graph[45][3988];
int compare(const void *a,const void *b){return ((const Edge*)a)->id-((const Edge*)b)->id;}
int main(void){
    int x,y;
    while(scanf("%d%d",&x,&y)==2&&(x||y)){
        int start=x<y?x:y,degree[45]={0},count=0;
        do{
            int id;scanf("%d",&id);graph[x][degree[x]++]=(Edge){id,y};graph[y][degree[y]++]=(Edge){id,x};count++;
            scanf("%d%d",&x,&y);
        }while(x||y);
        int valid=1;for(int v=1;v<=44;v++){if(degree[v]%2)valid=0;qsort(graph[v],degree[v],sizeof(Edge),compare);}
        int used[1995]={0},next[45]={0},vertices[1995],edge_stack[1994],route[1994],size=1,edge_size=0,route_size=0;vertices[0]=start;
        if(valid)while(size){
            int u=vertices[size-1];while(next[u]<degree[u]&&used[graph[u][next[u]].id])next[u]++;
            if(next[u]==degree[u]){size--;if(edge_size)route[route_size++]=edge_stack[--edge_size];}
            else{Edge edge=graph[u][next[u]++];used[edge.id]=1;vertices[size++]=edge.to;edge_stack[edge_size++]=edge.id;}
        }
        if(!valid||route_size!=count)printf("Round trip does not exist.\n\n");
        else{for(int i=route_size-1;i>=0;i--){if(i<route_size-1)putchar(' ');printf("%d",route[i]);}printf("\n\n");}
    }
    return 0;
}
