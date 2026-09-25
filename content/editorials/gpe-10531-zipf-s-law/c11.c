#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static int compare_words(const void *left,const void *right){return strcmp(*(char *const*)left,*(char *const*)right);}
static void add_word(char ***words,int *count,int *capacity,const char *word){
 if(*count==*capacity){*capacity=*capacity?2*(*capacity):128;*words=realloc(*words,(size_t)*capacity*sizeof(char*));}
 (*words)[*count]=malloc(strlen(word)+1);strcpy((*words)[(*count)++],word);
}
int main(void){
 char line[65536],word[65536];int first=1;
 while(fgets(line,sizeof(line),stdin)){
  char *start=line;while(*start==' '||*start=='\t'||*start=='\r'||*start=='\n')start++;
  if(!*start)continue;int target=0;
  while(*start>='0'&&*start<='9'){target=target*10+*start-'0';if(target>10001)target=10001;start++;}
  char **words=NULL;int count=0,capacity=0;
  while(fgets(line,sizeof(line),stdin)){
   size_t length=strlen(line);while(length&&(line[length-1]=='\n'||line[length-1]=='\r'))line[--length]=0;
   if(strcmp(line,"EndOfText")==0)break;
   int used=0;
   for(size_t i=0;i<=length;i++){
    char ch=line[i];int letter=(ch>='a'&&ch<='z')||(ch>='A'&&ch<='Z');
    if(letter){word[used++]=ch>='A'&&ch<='Z'?ch-'A'+'a':ch;}
    else if(used){word[used]=0;add_word(&words,&count,&capacity,word);used=0;}
   }
  }
  qsort(words,count,sizeof(char*),compare_words);
  if(!first)putchar('\n');first=0;int found=0;
  for(int i=0;i<count;){int j=i+1;while(j<count&&strcmp(words[i],words[j])==0)j++;
   if(j-i==target){puts(words[i]);found=1;}i=j;
  }
  if(!found)puts("There is no such word.");
  for(int i=0;i<count;i++)free(words[i]);free(words);
 }
 return 0;
}
