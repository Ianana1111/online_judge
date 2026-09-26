#include <stdio.h>
#include <stdlib.h>
typedef struct { int amount,index; } Item;
int descending(const void *a,const void *b){const Item *x=a,*y=b;return x->amount!=y->amount?y->amount-x->amount:x->index-y->index;}
int main(void){
    int teams,tables;
    while(scanf("%d%d",&teams,&tables)==2&&(teams||tables)){
        Item group[70],table[50];int counts[70],assignment[70][50],possible=1;
        for(int i=0;i<teams;i++){scanf("%d",&group[i].amount);group[i].index=i;counts[i]=group[i].amount;}
        for(int i=0;i<tables;i++){scanf("%d",&table[i].amount);table[i].index=i+1;}
        qsort(group,teams,sizeof(Item),descending);
        for(int row=0;row<teams;row++){
            int count=group[row].amount,index=group[row].index;qsort(table,tables,sizeof(Item),descending);
            if(count>tables||table[count-1].amount==0){possible=0;break;}
            for(int j=0;j<count;j++){assignment[index][j]=table[j].index;table[j].amount--;}
        }
        if(!possible){puts("0");continue;}puts("1");
        for(int i=0;i<teams;i++){for(int j=0;j<counts[i];j++)printf("%s%d",j?" ":"",assignment[i][j]);putchar('\n');}
    }
    return 0;
}
