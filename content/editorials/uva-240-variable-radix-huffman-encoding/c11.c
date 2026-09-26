#include <stdio.h>
#include <string.h>
typedef struct {int weight,letter,count,children[10],active;} Node;
Node nodes[80];char codes[26][64];int used,radix,n;
int add(int weight,int letter){int id=used++;nodes[id]=(Node){weight,letter,0,{0},1};return id;}
int take(void){int best=-1;for(int i=0;i<used;i++)if(nodes[i].active&&(best<0||nodes[i].weight<nodes[best].weight||(nodes[i].weight==nodes[best].weight&&nodes[i].letter<nodes[best].letter)))best=i;nodes[best].active=0;return best;}
void visit(int id,char *prefix,int depth){Node *node=&nodes[id];if(!node->count){if(node->letter<n){prefix[depth]='\0';strcpy(codes[node->letter],prefix);}return;}for(int d=0;d<radix;d++){prefix[depth]=(char)('0'+d);visit(node->children[d],prefix,depth+1);}}
int main(void){int set=0;while(scanf("%d",&radix)==1&&radix){scanf("%d",&n);used=0;int frequency[26],active=n;for(int i=0;i<n;i++){scanf("%d",&frequency[i]);add(frequency[i],i);}int dummy=26;while(active<radix||(active-1)%(radix-1)){add(0,dummy++);active++;}
    while(active>1){int children[10],weight=0,letter=100;for(int d=0;d<radix;d++){int id=take();children[d]=id;weight+=nodes[id].weight;if(nodes[id].letter<letter)letter=nodes[id].letter;}int id=add(weight,letter);nodes[id].count=radix;memcpy(nodes[id].children,children,radix*sizeof(int));active-=radix-1;}
    char prefix[64];visit(take(),prefix,0);long long total=0,weighted=0;for(int i=0;i<n;i++){total+=frequency[i];weighted+=(long long)frequency[i]*strlen(codes[i]);}long long rounded=(2*weighted*100+total)/(2*total);printf("Set %d; average length %lld.%02lld\n",++set,rounded/100,rounded%100);for(int i=0;i<n;i++)printf("    %c: %s\n",'A'+i,codes[i]);putchar('\n');
}return 0;}
