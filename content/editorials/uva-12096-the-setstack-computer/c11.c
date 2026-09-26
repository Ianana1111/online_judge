#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#define BUCKETS 4096
typedef struct{int *item,size,next;uint64_t hash;} Set;
Set values[2001];int buckets[BUCKETS],value_count;
int intern(int *items,int size){
    uint64_t hash=1469598103934665603ULL;
    for(int i=0;i<size;i++){hash^=(unsigned int)items[i];hash*=1099511628211ULL;}
    hash^=(unsigned int)size;int bucket=(int)(hash&(BUCKETS-1));
    for(int id=buckets[bucket];id>=0;id=values[id].next){
        Set old=values[id];if(old.hash==hash&&old.size==size&&(size==0||!memcmp(old.item,items,size*sizeof(int)))){free(items);return id;}
    }
    int id=value_count++;values[id]=(Set){items,size,buckets[bucket],hash};buckets[bucket]=id;return id;
}
int main(void){
    int tests;scanf("%d",&tests);
    while(tests--){
        int operations;scanf("%d",&operations);for(int i=0;i<BUCKETS;i++)buckets[i]=-1;value_count=0;int empty=intern(NULL,0),stack[2000],size=0;
        while(operations--){
            char command[10];scanf("%9s",command);
            if(!strcmp(command,"PUSH"))stack[size++]=empty;
            else if(!strcmp(command,"DUP")){int top=stack[size-1];stack[size++]=top;}
            else{
                int a=stack[--size],b=stack[--size];Set left=values[a],right=values[b];int *result=(int*)malloc((left.size+right.size+1)*sizeof(int)),count=0;
                if(!strcmp(command,"ADD")){
                    int inserted=0;
                    for(int i=0;i<right.size;i++){int item=right.item[i];if(!inserted&&a<item){result[count++]=a;inserted=1;}result[count++]=item;if(item==a)inserted=1;}
                    if(!inserted)result[count++]=a;
                }else{
                    int i=0,j=0,unite=!strcmp(command,"UNION");
                    while(i<left.size||j<right.size){
                        if(j==right.size||(i<left.size&&left.item[i]<right.item[j])){if(unite)result[count++]=left.item[i];i++;}
                        else if(i==left.size||right.item[j]<left.item[i]){if(unite)result[count++]=right.item[j];j++;}
                        else{result[count++]=left.item[i];i++;j++;}
                    }
                }
                stack[size++]=intern(result,count);
            }
            printf("%d\n",values[stack[size-1]].size);
        }
        puts("***");for(int id=0;id<value_count;id++)free(values[id].item);
    }
    return 0;
}
