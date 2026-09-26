#include <stdio.h>
#include <string.h>
int grid[81],row[9],column[9],box[9],empty[81],count;
int search(int at){
    if(at==count)return 1;
    int pick=at,options=0,minimum=10;
    for(int i=at;i<count;i++){
        int cell=empty[i],r=cell/9,c=cell%9,b=r/3*3+c/3;
        int mask=511&~(row[r]|column[c]|box[b]),bits=0;
        for(int remaining=mask;remaining;remaining&=remaining-1)bits++;
        if(bits<minimum){minimum=bits;options=mask;pick=i;}
        if(minimum==0)return 0;
    }
    int swap=empty[at];empty[at]=empty[pick];empty[pick]=swap;
    int cell=empty[at],r=cell/9,c=cell%9,b=r/3*3+c/3;
    while(options){
        int bit=options&-options;options-=bit;int digit=1;
        for(int value=bit;value>1;value>>=1)digit++;
        grid[cell]=digit;row[r]|=bit;column[c]|=bit;box[b]|=bit;
        if(search(at+1))return 1;
        row[r]&=~bit;column[c]&=~bit;box[b]&=~bit;grid[cell]=0;
    }
    swap=empty[at];empty[at]=empty[pick];empty[pick]=swap;return 0;
}
int main(void){
    int tests;if(scanf("%d",&tests)!=1)return 0;
    while(tests--){
        memset(row,0,sizeof(row));memset(column,0,sizeof(column));memset(box,0,sizeof(box));count=0;int valid=1;
        for(int cell=0;cell<81;cell++){
            int value;scanf("%d",&value);grid[cell]=value;
            int r=cell/9,c=cell%9,b=r/3*3+c/3;
            if(value){int bit=1<<(value-1);if((row[r]|column[c]|box[b])&bit)valid=0;row[r]|=bit;column[c]|=bit;box[b]|=bit;}
            else empty[count++]=cell;
        }
        if(!valid||!search(0)){puts("NO");continue;}
        for(int r=0;r<9;r++){for(int c=0;c<9;c++){if(c)putchar(' ');printf("%d",grid[r*9+c]);}putchar('\n');}
    }
    return 0;
}
