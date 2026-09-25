#include <stdio.h>
#include <string.h>
static const char* months[]={"pop","no","zip","zotz","tzec","xul","yoxkin","mol","chen","yax","zac","ceh","mac","kankin","muan","pax","koyab","cumhu","uayet"};
static const char* names[]={"imix","ik","akbal","kan","chicchan","cimi","manik","lamat","muluk","ok","chuen","eb","ben","ix","mem","cib","caban","eznab","canac","ahau"};
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;printf("%d\n",tests);
 while(tests--){
  int day,year;char month[24];scanf("%d. %23s %d",&day,month,&year);
  int index=0;while(index<19&&strcmp(months[index],month)!=0)index++;
  int elapsed=year*365+index*20+day;
  printf("%d %s %d\n",elapsed%13+1,names[elapsed%20],elapsed/260);
 }
 return 0;
}
