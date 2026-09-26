#include <stdio.h>
#include <string.h>
#define BASE 1000000000ULL
/* At most C(200,100)<10^60 paths: eight nine-digit limbs suffice. */
typedef struct {unsigned int digit[8];} Big;
void add(Big *a,const Big *b){
    unsigned long long carry=0;
    for(int i=0;i<8;i++){unsigned long long value=(unsigned long long)a->digit[i]+b->digit[i]+carry;a->digit[i]=(unsigned int)(value%BASE);carry=value/BASE;}
}
void print(Big a){int last=7;while(last>0&&a.digit[last]==0)last--;printf("%u",a.digit[last]);for(int i=last-1;i>=0;i--)printf("%09u",a.digit[i]);}
int main(void){
    int width,height;
    while(scanf("%d%d",&width,&height)==2&&(width||height)){
        int blocked[101][101]={{0}},count;scanf("%d",&count);
        while(count--){int x,y;scanf("%d%d",&x,&y);blocked[y][x]=1;}
        Big ways[101]={0};ways[0].digit[0]=1;
        for(int y=0;y<=height;y++)for(int x=0;x<=width;x++){
            if(blocked[y][x])memset(&ways[x],0,sizeof(Big));else if(x>0)add(&ways[x],&ways[x-1]);
        }
        int zero=1,one=ways[width].digit[0]==1;
        for(int i=0;i<8;i++){if(ways[width].digit[i])zero=0;if(i&&ways[width].digit[i])one=0;}
        if(zero)puts("There is no path.");
        else if(one)puts("There is one path from Little Red Riding Hood's house to her grandmother's house.");
        else{printf("There are ");print(ways[width]);puts(" paths from Little Red Riding Hood's house to her grandmother's house.");}
    }
    return 0;
}
