#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
typedef struct {uint32_t mask;int group;} Placement;
typedef struct {uint64_t key,value;} Entry;
Entry *memo;size_t capacity,used;Placement anchors[20][20];int degree[20],counts[10],widths[10],heights[10],groups,area;uint32_t full,multiplier[10];
uint64_t mix(uint64_t key){key^=key>>30;key*=UINT64_C(0xbf58476d1ce4e5b9);key^=key>>27;key*=UINT64_C(0x94d049bb133111eb);return key^(key>>31);}
void grow(void){size_t old_capacity=capacity;Entry *old=memo;capacity*=2;memo=(Entry*)calloc(capacity,sizeof(Entry));for(size_t i=0;i<old_capacity;i++)if(old[i].key){size_t p=(size_t)mix(old[i].key)&(capacity-1);while(memo[p].key)p=(p+1)&(capacity-1);memo[p]=old[i];}free(old);}
uint64_t solve(uint32_t occupied,uint32_t code){if(occupied==full)return code==0;uint64_t key=(((uint64_t)code<<area)|occupied)+1;size_t p=(size_t)mix(key)&(capacity-1);while(memo[p].key&&memo[p].key!=key)p=(p+1)&(capacity-1);if(memo[p].key)return memo[p].value;int cell=0;while(occupied>>cell&1)cell++;uint64_t result=0;
    for(int i=0;i<degree[cell];i++){Placement place=anchors[cell][i];int g=place.group;if((code/multiplier[g])%(counts[g]+1)==0||(place.mask&occupied))continue;result+=solve(occupied|place.mask,code-multiplier[g]);}
    if((used+1)*2>=capacity)grow();p=(size_t)mix(key)&(capacity-1);while(memo[p].key)p=(p+1)&(capacity-1);memo[p]=(Entry){key,result};used++;return result;
}
int main(void){int width,height;while(scanf("%d%d%d",&width,&height,&groups)==3){area=width*height;full=(1u<<area)-1;uint32_t code=0,base=1;for(int g=0;g<groups;g++){scanf("%d%d%d",&counts[g],&widths[g],&heights[g]);multiplier[g]=base;code+=counts[g]*base;base*=counts[g]+1;}for(int cell=0;cell<area;cell++)degree[cell]=0;
    for(int g=0;g<groups;g++)for(int turn=0;turn<(widths[g]==heights[g]?1:2);turn++){int w=turn?heights[g]:widths[g],h=turn?widths[g]:heights[g];for(int row=0;row+h<=height;row++)for(int col=0;col+w<=width;col++){uint32_t mask=0;for(int y=row;y<row+h;y++)for(int x=col;x<col+w;x++)mask|=1u<<(y*width+x);int cell=row*width+col;anchors[cell][degree[cell]++]=(Placement){mask,g};}}
    capacity=1024;used=0;memo=(Entry*)calloc(capacity,sizeof(Entry));printf("%llu\n",(unsigned long long)solve(0,code));free(memo);
}return 0;}
