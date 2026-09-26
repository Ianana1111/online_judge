#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

char *readLine(void) {
    size_t used=0,capacity=64;char *s=(char*)malloc(capacity);int c;
    while((c=getchar())!=EOF&&c!='\n') {
        if(used+1==capacity){capacity*=2;s=(char*)realloc(s,capacity);}
        s[used++]=(char)c;
    }
    if(c==EOF&&used==0){free(s);return NULL;}
    s[used]='\0';return s;
}

#include <stdint.h>
typedef struct {long long sum;uint32_t mask;} Entry;
int integer_compare(const void *a,const void *b){long long x=*(const long long*)a,y=*(const long long*)b;return(x>y)-(x<y);}
int entry_compare(const void *a,const void *b){const Entry *p=(const Entry*)a,*q=(const Entry*)b;if(p->sum!=q->sum)return(p->sum>q->sum)-(p->sum<q->sum);return(p->mask>q->mask)-(p->mask<q->mask);}
int bits(uint32_t n){int count=0;while(n){n&=n-1;count++;}return count;}
int answer_compare(const void *a,const void *b){uint32_t x=*(const uint32_t*)a,y=*(const uint32_t*)b;int nx=bits(x),ny=bits(y);if(nx!=ny)return nx-ny;uint32_t difference=x^y;if(!difference)return 0;return(x&(difference&-difference))?-1:1;}
Entry *half(long long *values,int begin,int length){int count=1<<length;Entry *out=(Entry*)malloc(count*sizeof(Entry));out[0]=(Entry){0,0};for(uint32_t mask=1;mask<(uint32_t)count;mask++){uint32_t bit=mask&-mask;int index=0;for(uint32_t p=bit;p>1;p>>=1)index++;out[mask]=(Entry){out[mask^bit].sum+values[begin+index],mask};}qsort(out,count,sizeof(Entry),entry_compare);return out;}
int lower(Entry *entries,int n,long long value){int l=0,r=n;while(l<r){int m=(l+r)/2;if(entries[m].sum<value)l=m+1;else r=m;}return l;}
int main(void){char *line;int first=1;while((line=readLine())!=NULL){char *p=line;while(isspace((unsigned char)*p))p++;if(*p=='.'){free(line);break;}if(!*p){free(line);continue;}long long values[30],total=0;int n=0;while(*p){if(*p>='0'&&*p<='9'){values[n++]=strtoll(p,&p,10);total+=values[n-1];}else p++;}free(line);qsort(values,n,sizeof(long long),integer_compare);uint32_t answers[10000];int count=0;
    if(total%2==0){int middle=n/2,nl=1<<middle,nr=1<<(n-middle);Entry *left=half(values,0,middle),*right=half(values,middle,n-middle);for(int i=0;i<nl;i++){long long target=total/2-left[i].sum;for(int j=lower(right,nr,target);j<nr&&right[j].sum==target;j++)answers[count++]=left[i].mask|(right[j].mask<<middle);}free(left);free(right);}
    if(!first)putchar('\n');first=0;if(!count){puts("No such subset");continue;}qsort(answers,count,sizeof(uint32_t),answer_compare);printf("%d subsets.\n",count);for(int i=0;i<count;i++){putchar('{');int initial=1;for(int j=0;j<n;j++)if(answers[i]>>j&1){printf("%s%lld",initial?"":" ",values[j]);initial=0;}puts("}");}
}return 0;}
