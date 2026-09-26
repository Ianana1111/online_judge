#include <stdio.h>
#include <string.h>
char names[400][25];int type_count,graph[400][100],degree[400],adjacent[100][100],owner[100],seen[100],outlet_count;
int id(const char *name){for(int i=0;i<type_count;i++)if(!strcmp(names[i],name))return i;strcpy(names[type_count],name);return type_count++;}
int augment(int device){
    for(int outlet=0;outlet<outlet_count;outlet++)if(adjacent[device][outlet]&&!seen[outlet]){
        seen[outlet]=1;if(owner[outlet]<0||augment(owner[outlet])){owner[outlet]=device;return 1;}
    }
    return 0;
}
int main(void){
    int tests;scanf("%d",&tests);
    for(int test=0;test<tests;test++){
        type_count=0;memset(degree,0,sizeof(degree));char name[25],other[25];int outlets[100],devices[100],device_count,adapters;
        scanf("%d",&outlet_count);for(int i=0;i<outlet_count;i++){scanf("%24s",name);outlets[i]=id(name);}
        scanf("%d",&device_count);for(int i=0;i<device_count;i++){scanf("%24s%24s",name,other);devices[i]=id(other);}
        scanf("%d",&adapters);while(adapters--){scanf("%24s%24s",name,other);int from=id(name),to=id(other);graph[from][degree[from]++]=to;}
        for(int i=0;i<device_count;i++){
            int reached[400]={0},queue[400],front=0,back=0;queue[back++]=devices[i];reached[devices[i]]=1;
            while(front<back){int u=queue[front++];for(int e=0;e<degree[u];e++){int v=graph[u][e];if(!reached[v]){reached[v]=1;queue[back++]=v;}}}
            for(int j=0;j<outlet_count;j++)adjacent[i][j]=reached[outlets[j]];
        }
        for(int j=0;j<outlet_count;j++)owner[j]=-1;int connected=0;
        for(int i=0;i<device_count;i++){memset(seen,0,sizeof(seen));connected+=augment(i);}
        if(test)putchar('\n');printf("%d\n",device_count-connected);
    }
    return 0;
}
