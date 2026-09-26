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

char *copy(const char *s){char *result=(char*)malloc(strlen(s)+1);strcpy(result,s);return result;}

#include <limits.h>
int main(void){
    char *line;
    while((line=readLine())!=NULL){
        if(!*line){free(line);continue;}int width=atoi(line);free(line);if(!width)break;
        char **words=(char**)malloc(10000*sizeof(char*));int n=0;
        while((line=readLine())!=NULL){
            size_t size=strlen(line);if(size&&line[size-1]=='\r')line[--size]='\0';if(!size){free(line);break;}
            for(char *word=strtok(line," \t");word;word=strtok(NULL," \t"))words[n++]=copy(word);free(line);
        }
        int *cost=(int*)calloc(n+1,sizeof(int)),*next=(int*)malloc(n*sizeof(int)),*length=(int*)calloc(n+1,sizeof(int));unsigned char **sequence=(unsigned char**)calloc(n+1,sizeof(unsigned char*));
        for(int i=n-1;i>=0;i--){
            int letters=0,best=INT_MAX,chosen=-1,best_q=0,best_r=0;
            for(int j=i;j<n;j++){
                letters+=(int)strlen(words[j]);int gaps=j-i;if(letters+gaps>width)break;
                int q=0,r=0,local;
                if(!gaps)local=letters==width?0:500;
                else{q=(width-letters)/gaps;r=(width-letters)%gaps;local=(gaps-r)*(q-1)*(q-1)+r*q*q;}
                int total=local+cost[j+1],better=total<best;
                if(total==best){
                    int old_gaps=chosen-i,new_length=gaps+length[j+1],old_length=old_gaps+length[chosen+1],at=0;
                    while(at<new_length&&at<old_length){
                        int a=at<gaps?q+(at>=gaps-r):sequence[j+1][at-gaps];
                        int b=at<old_gaps?best_q+(at>=old_gaps-best_r):sequence[chosen+1][at-old_gaps];
                        if(a!=b){better=a<b;break;}at++;
                    }
                    if(at==new_length||at==old_length)better=new_length>old_length;
                }
                if(better){best=total;chosen=j;best_q=q;best_r=r;}
            }
            cost[i]=best;next[i]=chosen+1;int gaps=chosen-i;length[i]=gaps+length[chosen+1];
            if(length[i])sequence[i]=(unsigned char*)malloc(length[i]);
            for(int k=0;k<gaps;k++)sequence[i][k]=(unsigned char)(best_q+(k>=gaps-best_r));
            if(length[chosen+1])memcpy(sequence[i]+gaps,sequence[chosen+1],length[chosen+1]);
        }
        for(int i=0;i<n;i=next[i]){
            int end=next[i],gaps=end-i-1,letters=0;for(int j=i;j<end;j++)letters+=(int)strlen(words[j]);
            int q=gaps?(width-letters)/gaps:0,r=gaps?(width-letters)%gaps:0;
            for(int j=i;j<end;j++){if(j>i){int spaces=q+(j-i-1>=gaps-r);while(spaces--)putchar(' ');}printf("%s",words[j]);}putchar('\n');
        }
        putchar('\n');for(int i=0;i<n;i++){free(words[i]);free(sequence[i]);}free(words);free(sequence);free(cost);free(next);free(length);
    }
    return 0;
}
