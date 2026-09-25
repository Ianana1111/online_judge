#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int compare(const void *a,const void *b) {return strcmp((const char*)a,(const char*)b);}
int main(void) {
    int n;scanf("%d",&n);
    char countries[2000][101],line[1000];
    int ch=getchar();while(ch!='\n' && ch!=EOF) ch=getchar();
    for(int i=0;i<n;++i) {
        fgets(line,sizeof(line),stdin);
        sscanf(line,"%100s",countries[i]);
    }
    qsort(countries,n,sizeof(countries[0]),compare);
    for(int i=0;i<n;) {
        int end=i+1;
        while(end<n && strcmp(countries[i],countries[end])==0) ++end;
        printf("%s %d\n",countries[i],end-i);
        i=end;
    }
    return 0;
}
