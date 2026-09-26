#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *readLine(void) {
    size_t used=0,capacity=64;char *s=(char*)malloc(capacity);int c;
    while((c=getchar())!=EOF&&c!='\n') {
        if(used+1==capacity){capacity*=2;s=(char*)realloc(s,capacity);}
        s[used++]=(char)c;
    }
    if(c==EOF&&used==0){free(s);return NULL;}
    s[used]='\0';return s;
}

char *normalize(char *s) {
    int negative=*s=='-';char *digits=s+(*s=='-'||*s=='+');
    while(digits[0]=='0'&&digits[1])digits++;
    if(strcmp(digits,"0")==0)negative=0;
    memmove(s+negative,digits,strlen(digits)+1);
    if(negative)s[0]='-';return s;
}

int compare(const void *a,const void *b){return strcmp(*(char*const*)a,*(char*const*)b);}
int parse(char *line,char ***result) {
    int n=0,capacity=16;char **items=(char**)malloc(capacity*sizeof(char*));
    for(char *s=strtok(line," \t\r");s;s=strtok(NULL," \t\r")) {
        if(n==capacity){capacity*=2;items=(char**)realloc(items,capacity*sizeof(char*));}
        items[n++]=normalize(s);
    }
    qsort(items,n,sizeof(char*),compare);
    int size=0;for(int i=0;i<n;i++)if(size==0||strcmp(items[i],items[size-1]))items[size++]=items[i];
    *result=items;return size;
}
int main(void) {
    char *left;
    while((left=readLine())!=NULL) {
        char *right=readLine();if(!right){free(left);break;}
        char **a,**b;int n=parse(left,&a),m=parse(right,&b),i=0,j=0,common=0;
        while(i<n&&j<m){int order=strcmp(a[i],b[j]);if(order<0)i++;else if(order>0)j++;else{i++;j++;common++;}}
        if(common==n&&common==m)puts("A equals B");
        else if(common==n)puts("A is a proper subset of B");
        else if(common==m)puts("B is a proper subset of A");
        else if(common==0)puts("A and B are disjoint");
        else puts("I'm confused!");
        free(a);free(b);free(left);free(right);
    }
    return 0;
}
