import java.io.BufferedInputStream;
import java.util.Arrays;
public class Main {
    static BufferedInputStream input=new BufferedInputStream(System.in);
    static int nextInt()throws Exception{int c;do{c=input.read();}while(c>=0&&c<=32);int value=0;while(c>32){value=value*10+c-'0';c=input.read();}return value;}
    static int[][]capacity;static int[]level,next;static int vertices,sink;
    static boolean layers(int source){
        Arrays.fill(level,-1);int[]queue=new int[vertices];int front=0,back=0;queue[back++]=source;level[source]=0;
        while(front<back){int u=queue[front++];for(int v=0;v<vertices;v++)if(capacity[u][v]>0&&level[v]<0){level[v]=level[u]+1;queue[back++]=v;}}
        return level[sink]>=0;
    }
    static int send(int u,int amount){
        if(u==sink)return amount;
        for(;next[u]<vertices;next[u]++){
            int v=next[u];if(capacity[u][v]<=0||level[v]!=level[u]+1)continue;
            int pushed=send(v,Math.min(amount,capacity[u][v]));
            if(pushed>0){capacity[u][v]-=pushed;capacity[v][u]+=pushed;return pushed;}
        }
        return 0;
    }
    public static void main(String[]args)throws Exception{
        int tests=nextInt();StringBuilder out=new StringBuilder();
        for(int test=1;test<=tests;test++){
            int rows=nextInt(),columns=nextInt(),source=rows+columns;sink=source+1;vertices=sink+1;capacity=new int[vertices][vertices];level=new int[vertices];next=new int[vertices];
            int previous=0;
            for(int i=0;i<rows;i++){int cumulative=nextInt();capacity[source][i]=cumulative-previous-columns;previous=cumulative;for(int j=0;j<columns;j++)capacity[i][rows+j]=19;}
            previous=0;
            for(int j=0;j<columns;j++){int cumulative=nextInt();capacity[rows+j][sink]=cumulative-previous-rows;previous=cumulative;}
            while(layers(source)){Arrays.fill(next,0);while(send(source,8000)>0){}}
            if(test>1)out.append('\n');out.append("Matrix ").append(test).append('\n');
            for(int i=0;i<rows;i++){for(int j=0;j<columns;j++){if(j>0)out.append(' ');out.append(20-capacity[i][rows+j]);}out.append('\n');}
        }
        System.out.print(out);
    }
}
