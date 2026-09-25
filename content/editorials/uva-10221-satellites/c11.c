#include <math.h>
#include <stdio.h>
#include <string.h>
int main(void){
 long long height,angle;char unit[8];const double pi=acos(-1.0);
 while(scanf("%lld %lld %7s",&height,&angle,unit)==3){
  double degrees=(double)angle;
  if(strcmp(unit,"min")==0)degrees/=60.0;
  degrees=fmod(degrees,360.0);
  if(degrees>180.0)degrees=360.0-degrees;
  double radius=6440.0+height,theta=degrees*pi/180.0;
  printf("%.6f %.6f\n",radius*theta,2*radius*sin(theta/2));
 }
 return 0;
}
