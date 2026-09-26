#include <stdio.h>
#include <string.h>
void parse(const char *text,long long *coefficient,long long *constant){
    *coefficient=*constant=0;int i=0;
    while(text[i]){
        int sign=1;if(text[i]=='+'||text[i]=='-'){if(text[i]=='-')sign=-1;i++;}
        long long value=0;int digits=0;
        while(text[i]>='0'&&text[i]<='9'){digits=1;value=value*10+text[i]-'0';i++;}
        if(text[i]=='x'){*coefficient+=sign*(digits?value:1);i++;}else *constant+=sign*value;
    }
}
int main(void){
    int tests;scanf("%d",&tests);
    while(tests--){
        char text[256];scanf("%255s",text);char *equal=strchr(text,'=');*equal='\0';
        long long a,b,c,d;parse(text,&a,&b);parse(equal+1,&c,&d);
        long long numerator=d-b,denominator=a-c;
        if(!denominator){puts(numerator?"IMPOSSIBLE":"IDENTITY");continue;}
        if(denominator<0){denominator=-denominator;numerator=-numerator;}
        long long answer=numerator/denominator;
        if(numerator<0&&numerator%denominator)answer--;
        printf("%lld\n",answer);
    }
    return 0;
}
