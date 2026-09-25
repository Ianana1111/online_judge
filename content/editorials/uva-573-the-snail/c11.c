#include <stdio.h>
int main(void) {
    int h,u,d,f;
    while(scanf("%d %d %d %d", &h,&u,&d,&f)==4 && h) {
        int height=0, climb=u*100, fatigue=u*f;
        for(int day=1;;++day) {
            height+=climb>0?climb:0;
            if(height>h*100) {printf("success on day %d\n",day);break;}
            height-=d*100;
            if(height<0) {printf("failure on day %d\n",day);break;}
            climb-=fatigue;
        }
    }
    return 0;
}
