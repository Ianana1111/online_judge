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

typedef struct {char *x,*y;} Point;
int point_compare(const void *a,const void *b){const Point *p=(const Point*)a,*q=(const Point*)b;int c=signed_compare(p->x,q->x);return c?c:signed_compare(p->y,q->y);}
char *cross(Point a,Point b,Point c){char *ux=signed_subtract(b.x,a.x),*uy=signed_subtract(b.y,a.y),*vx=signed_subtract(c.x,a.x),*vy=signed_subtract(c.y,a.y),*left=signed_multiply(ux,vy),*right=signed_multiply(uy,vx),*result=signed_subtract(left,right);free(ux);free(uy);free(vx);free(vy);free(left);free(right);return result;}
void accumulate(char **total,char *value){char *next=signed_add(*total,value);free(*total);*total=next;}
int main(void){char *token;while((token=word())!=NULL){int n=atoi(token);free(token);if(n<3)break;Point points[100];int hull[200],size=0;for(int i=0;i<n;i++){points[i].x=signed_normalize(word());points[i].y=signed_normalize(word());}qsort(points,n,sizeof(Point),point_compare);
    for(int i=0;i<n;i++){while(size>=2){char *turn=cross(points[hull[size-2]],points[hull[size-1]],points[i]);int positive=sign(turn)>0;free(turn);if(positive)break;size--;}hull[size++]=i;}int threshold=size+1;for(int i=n-2;i>=0;i--){while(size>=threshold){char *turn=cross(points[hull[size-2]],points[hull[size-1]],points[i]);int positive=sign(turn)>0;free(turn);if(positive)break;size--;}hull[size++]=i;}size--;
    char *area=copy("0"),*moment_x=copy("0"),*moment_y=copy("0");for(int i=0;i<size;i++){Point a=points[hull[i]],b=points[hull[(i+1)%size]];char *left=signed_multiply(a.x,b.y),*right=signed_multiply(a.y,b.x),*weight=signed_subtract(left,right),*sx=signed_add(a.x,b.x),*sy=signed_add(a.y,b.y),*mx=signed_multiply(sx,weight),*my=signed_multiply(sy,weight);accumulate(&area,weight);accumulate(&moment_x,mx);accumulate(&moment_y,my);free(left);free(right);free(weight);free(sx);free(sy);free(mx);free(my);}
    char *denominator=times(area,3),*x=format_ratio(moment_x,denominator,3),*y=format_ratio(moment_y,denominator,3);printf("%s %s\n",x,y);free(area);free(moment_x);free(moment_y);free(denominator);free(x);free(y);for(int i=0;i<n;i++){free(points[i].x);free(points[i].y);}
}return 0;}
