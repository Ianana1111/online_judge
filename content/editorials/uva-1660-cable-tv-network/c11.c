#include <stdio.h>
#include <string.h>
typedef struct {int to,next,capacity;} Edge;
Edge edges[10200];int head[100],level[100],current[100],count,nodes;
int number(void){int c;do{c=getchar();}while(c!=EOF&&(c<'0'||c>'9'));if(c==EOF)return -1;int n=0;do{n=n*10+c-'0';c=getchar();}while(c>='0'&&c<='9');return n;}
void add(int u,int v,int capacity){edges[count]=(Edge){v,head[u],capacity};head[u]=count++;edges[count]=(Edge){u,head[v],0};head[v]=count++;}
int bfs(int source,int sink){int queue[100],front=0,size=0;for(int i=0;i<nodes;i++)level[i]=-1;queue[size++]=source;level[source]=0;while(front<size){int u=queue[front++];for(int e=head[u];e!=-1;e=edges[e].next)if(edges[e].capacity&&level[edges[e].to]<0){level[edges[e].to]=level[u]+1;queue[size++]=edges[e].to;}}return level[sink]>=0;}
int dfs(int u,int sink,int amount){if(u==sink)return amount;for(int *e=&current[u];*e!=-1;*e=edges[*e].next){Edge *edge=&edges[*e];if(edge->capacity&&level[edge->to]==level[u]+1){int sent=dfs(edge->to,sink,amount<edge->capacity?amount:edge->capacity);if(sent){edge->capacity-=sent;edges[*e^1].capacity+=sent;return sent;}}}return 0;}
int flow(int source,int sink,int limit){int total=0;while(total<limit&&bfs(source,sink)){memcpy(current,head,nodes*sizeof(int));int sent;while(total<limit&&(sent=dfs(source,sink,limit-total)))total+=sent;}return total;}
int main(void){int n;while((n=number())>=0){int m=number(),adjacent[50][50]={{0}};for(int i=0;i<m;i++){int u=number(),v=number();adjacent[u][v]=adjacent[v][u]=1;}if(n<=1){printf("%d\n",n);continue;}int answer=n,complete=1;for(int u=0;u<n;u++){int degree=0;for(int v=0;v<n;v++)degree+=adjacent[u][v];if(degree<answer)answer=degree;if(degree<n-1)complete=0;}if(complete){printf("%d\n",n);continue;}
    for(int source=0;source<n&&answer;source++)for(int sink=source+1;sink<n&&answer;sink++){if(adjacent[source][sink])continue;nodes=2*n;count=0;for(int i=0;i<nodes;i++)head[i]=-1;for(int v=0;v<n;v++)add(2*v,2*v+1,(v==source||v==sink)?n:1);for(int u=0;u<n;u++)for(int v=0;v<n;v++)if(adjacent[u][v])add(2*u+1,2*v,n);int cut=flow(2*source+1,2*sink,answer);if(cut<answer)answer=cut;}
    printf("%d\n",answer);
}return 0;}
