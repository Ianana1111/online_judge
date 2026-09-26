#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cctype>
using namespace std;
char *word(void){
    int c;do{c=getchar();}while(c!=EOF&&isspace((unsigned char)c));
    if(c==EOF)return NULL;
    size_t size=0,capacity=32;char *text=(char*)malloc(capacity);
    do{if(size+1==capacity){capacity*=2;text=(char*)realloc(text,capacity);}text[size++]=(char)c;c=getchar();}while(c!=EOF&&!isspace((unsigned char)c));
    text[size]='\0';return text;
}

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
int compare(const char *a,const char *b){size_t x=strlen(a),y=strlen(b);if(x!=y)return x>y?1:-1;int sign=strcmp(a,b);return (sign>0)-(sign<0);}

char *signed_normalize(char *s){
    int negative=*s=='-';char *digits=s+(*s=='-'||*s=='+');
    while(digits[0]=='0'&&digits[1])digits++;if(strcmp(digits,"0")==0)negative=0;
    memmove(s+negative,digits,strlen(digits)+1);if(negative)s[0]='-';return s;
}

char *with_sign(char *magnitude,int negative){
    if(negative&&strcmp(magnitude,"0")){size_t n=strlen(magnitude);magnitude=(char*)realloc(magnitude,n+2);memmove(magnitude+1,magnitude,n+1);magnitude[0]='-';}return magnitude;
}
char *normalize(char *text){size_t first=0;while(text[first]=='0'&&text[first+1])first++;if(first)memmove(text,text+first,strlen(text+first)+1);return text;}
char *add(const char *a,const char *b){
    size_t x=strlen(a),y=strlen(b),size=(x>y?x:y)+1;
    char *result=(char*)malloc(size+1);result[size]='\0';int carry=0;
    for(size_t i=0;i<size;i++){int value=carry+(i<x?a[x-1-i]-'0':0)+(i<y?b[y-1-i]-'0':0);result[size-1-i]=(char)('0'+value%10);carry=value/10;}
    return normalize(result);
}
char *subtract(const char *a,const char *b){
    size_t x=strlen(a),y=strlen(b);char *result=(char*)malloc(x+1);result[x]='\0';int borrow=0;
    for(size_t i=0;i<x;i++){int value=a[x-1-i]-'0'-(i<y?b[y-1-i]-'0':0)-borrow;borrow=value<0;if(borrow)value+=10;result[x-1-i]=(char)('0'+value);}
    return normalize(result);
}

char *signed_add(const char *a,const char *b){
    int an=*a=='-',bn=*b=='-';const char *x=a+an,*y=b+bn;
    if(an==bn)return with_sign(add(x,y),an);
    int order=compare(x,y);if(order>=0)return with_sign(subtract(x,y),an);return with_sign(subtract(y,x),bn);
}

char *negate(const char *s){if(*s=='-')return copy(s+1);return with_sign(copy(s),1);}

char *signed_subtract(const char *a,const char *b){char *negative=negate(b),*result=signed_add(a,negative);free(negative);return result;}

char *unsigned_multiply(const char *a,const char *b){
    size_t n=strlen(a),m=strlen(b);unsigned char *digit=(unsigned char*)calloc(n+m,1);
    for(size_t i=0;i<n;i++){
        int carry=0;
        for(size_t j=0;j<m;j++){int value=digit[i+j]+(a[n-1-i]-'0')*(b[m-1-j]-'0')+carry;digit[i+j]=(unsigned char)(value%10);carry=value/10;}
        size_t at=i+m;while(carry){int value=digit[at]+carry;digit[at++]=(unsigned char)(value%10);carry=value/10;}
    }
    char *result=(char*)malloc(n+m+1);for(size_t i=0;i<n+m;i++)result[n+m-1-i]=(char)('0'+digit[i]);result[n+m]='\0';free(digit);return normalize(result);
}

char *signed_multiply(const char *a,const char *b){int an=*a=='-',bn=*b=='-';return with_sign(unsigned_multiply(a+an,b+bn),an!=bn);}

void unsigned_divide(const char *a,const char *b,char **quotient,char **remainder){
    size_t n=strlen(a);char *q=(char*)malloc(n+1),*r=copy("0");
    for(size_t i=0;i<n;i++){
        size_t length=strlen(r);r=(char*)realloc(r,length+2);r[length]=a[i];r[length+1]='\0';normalize(r);
        int digit=0;
        while(compare(r,b)>=0){char *next=subtract(r,b);free(r);r=next;digit++;}
        q[i]=(char)('0'+digit);
    }
    q[n]='\0';*quotient=normalize(q);*remainder=r;
}

int sign(const char *s){return strcmp(s,"0")==0?0:*s=='-'?-1:1;}
int signed_compare(const char *a,const char *b){int an=*a=='-',bn=*b=='-';if(an!=bn)return an?-1:1;int c=compare(a+an,b+bn);return an?-c:c;}
char *times(const char *a,int factor){char text[32];sprintf(text,"%d",factor);return signed_multiply(a,text);}
char *format_ratio(const char *numerator,const char *denominator,int places){
    int negative=(*numerator=='-')!=(*denominator=='-');const char *a=numerator+(*numerator=='-'),*b=denominator+(*denominator=='-');int scale=1;for(int i=0;i<places;i++)scale*=10;
    char text[32];sprintf(text,"%d",2*scale);char *product=unsigned_multiply(a,text),*sum=add(product,b),*twice=add(b,b),*q,*r;unsigned_divide(sum,twice,&q,&r);free(product);free(sum);free(twice);free(r);
    if(strcmp(q,"0")==0)negative=0;size_t n=strlen(q);if(n<=(size_t)places){char *p=(char*)malloc(places+2);int zeros=places+1-(int)n;memset(p,'0',zeros);strcpy(p+zeros,q);free(q);q=p;n=places+1;}
    int whole=(int)n-places;char *answer=(char*)malloc(n+negative+2),*out=answer;if(negative)*out++='-';memcpy(out,q,whole);out+=whole;*out++='.';memcpy(out,q+whole,places);out+=places;*out='\0';free(q);return answer;
}

#include <stdint.h>
typedef struct {char *x,*y;} Point;
typedef struct {char *x,*y,*denominator,*squared;} Circle;
void release(Circle c){free(c.x);free(c.y);free(c.denominator);free(c.squared);}
char *squared_sum(char *x,char *y){char *xx=signed_multiply(x,x),*yy=signed_multiply(y,y),*result=add(xx,yy);free(xx);free(yy);return result;}
Circle single(Point p){return(Circle){copy(p.x),copy(p.y),copy("1"),copy("0")};}
Circle diameter(Point a,Point b){char *x=signed_add(a.x,b.x),*y=signed_add(a.y,b.y),*dx=signed_subtract(a.x,b.x),*dy=signed_subtract(a.y,b.y),*r=squared_sum(dx,dy);free(dx);free(dy);return(Circle){x,y,copy("2"),r};}
int outside(Circle c,Point p){char *x=signed_multiply(p.x,c.denominator),*y=signed_multiply(p.y,c.denominator),*dx=signed_subtract(x,c.x),*dy=signed_subtract(y,c.y),*r=squared_sum(dx,dy);int result=compare(r,c.squared)>0;free(x);free(y);free(dx);free(dy);free(r);return result;}
Circle through_three(Point a,Point b,Point c){char *ux=signed_subtract(b.x,a.x),*uy=signed_subtract(b.y,a.y),*vx=signed_subtract(c.x,a.x),*vy=signed_subtract(c.y,a.y),*left=signed_multiply(ux,vy),*right=signed_multiply(uy,vx),*cross=signed_subtract(left,right),*d=times(cross,2);free(left);free(right);free(cross);Circle result;
    if(strcmp(d,"0")==0){Circle choices[3]={diameter(a,b),diameter(a,c),diameter(b,c)};int best=0;for(int i=1;i<3;i++)if(compare(choices[i].squared,choices[best].squared)>0)best=i;result=choices[best];for(int i=0;i<3;i++)if(i!=best)release(choices[i]);free(d);}
    else{char *u2=squared_sum(ux,uy),*v2=squared_sum(vx,vy);left=signed_multiply(u2,vy);right=signed_multiply(v2,uy);char *dx=signed_subtract(left,right);free(left);free(right);left=signed_multiply(ux,v2);right=signed_multiply(vx,u2);char *dy=signed_subtract(left,right);free(left);free(right);char *ax=signed_multiply(a.x,d),*ay=signed_multiply(a.y,d),*x=signed_add(ax,dx),*y=signed_add(ay,dy),*r=squared_sum(dx,dy);if(*d=='-'){char *next=negate(d);free(d);d=next;next=negate(x);free(x);x=next;next=negate(y);free(y);y=next;}result=(Circle){x,y,d,r};free(u2);free(v2);free(dx);free(dy);free(ax);free(ay);}
    free(ux);free(uy);free(vx);free(vy);return result;
}
void radius(char *s,char **numerator,char **denominator){int exponent=0;char *e=strchr(s,'e');if(!e)e=strchr(s,'E');if(e){exponent=atoi(e+1);*e='\0';}char *digits=(char*)malloc(strlen(s)+1);int used=0,fraction=0,after=0;for(char *p=s;*p;p++){if(*p=='.'){after=1;continue;}if(*p>='0'&&*p<='9'){digits[used++]=*p;if(after)fraction++;}}digits[used]='\0';normalize(digits);int scale=fraction-exponent;if(scale>=0){char *d=(char*)malloc(scale+2);d[0]='1';memset(d+1,'0',scale);d[scale+1]='\0';*denominator=d;}else{size_t n=strlen(digits);digits=(char*)realloc(digits,n-scale+1);memset(digits+n,'0',-scale);digits[n-scale]='\0';*denominator=copy("1");}*numerator=normalize(digits);}
int main(void){char *token;while((token=word())!=NULL){int n=atoi(token);free(token);if(!n)break;Point points[100];for(int i=0;i<n;i++){points[i].x=signed_normalize(word());points[i].y=signed_normalize(word());}token=word();char *rn,*rd;radius(token,&rn,&rd);free(token);uint32_t seed=10005;for(int i=n-1;i>0;i--){seed^=seed<<13;seed^=seed>>17;seed^=seed<<5;int j=(int)(seed%(i+1));Point swap=points[i];points[i]=points[j];points[j]=swap;}
    Circle circle=single(points[0]);for(int i=1;i<n;i++){if(!outside(circle,points[i]))continue;release(circle);circle=single(points[i]);for(int j=0;j<i;j++){if(!outside(circle,points[j]))continue;release(circle);circle=diameter(points[i],points[j]);for(int k=0;k<j;k++)if(outside(circle,points[k])){release(circle);circle=through_three(points[i],points[j],points[k]);}}}
    char *rd2=unsigned_multiply(rd,rd),*rn2=unsigned_multiply(rn,rn),*d2=unsigned_multiply(circle.denominator,circle.denominator),*left=unsigned_multiply(circle.squared,rd2),*right=unsigned_multiply(rn2,d2);puts(compare(left,right)<=0?"The polygon can be packed in the circle.":"There is no way of packing that polygon.");free(rd2);free(rn2);free(d2);free(left);free(right);free(rn);free(rd);release(circle);for(int i=0;i<n;i++){free(points[i].x);free(points[i].y);}
}return 0;}
