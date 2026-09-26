import java.io.BufferedInputStream;
import java.util.Arrays;
public class Main {
    static BufferedInputStream input=new BufferedInputStream(System.in);
    static long next()throws Exception{int c;do{c=input.read();}while(c>=0&&c<=32);if(c<0)return Long.MIN_VALUE;boolean negative=c=='-';if(c=='-'||c=='+')c=input.read();long value=0;while(c>32){value=value*10+c-'0';c=input.read();}return negative?-value:value;}
    static class Side implements Comparable<Side>{
        long line,begin,end;int id;Side(long l,long b,long e,int i){line=l;begin=b;end=e;id=i;}
        public int compareTo(Side other){int order=Long.compare(line,other.line);if(order==0)order=Long.compare(begin,other.begin);if(order==0)order=Long.compare(end,other.end);return order==0?Integer.compare(id,other.id):order;}
    }
    static int[]parent,size;static long[]area;
    static int find(int a){while(parent[a]!=a){parent[a]=parent[parent[a]];a=parent[a];}return a;}
    static void join(int a,int b){a=find(a);b=find(b);if(a==b)return;if(size[a]<size[b]){int t=a;a=b;b=t;}parent[b]=a;size[a]+=size[b];area[a]+=area[b];}
    static void connect(Side[]sides){
        Arrays.sort(sides);long line=0,end=0;int representative=-1;
        for(Side side:sides){
            if(representative>=0&&side.line==line&&side.begin<=end){join(representative,side.id);if(side.end>end){end=side.end;representative=side.id;}}
            else{line=side.line;end=side.end;representative=side.id;}
        }
    }
    public static void main(String[]args)throws Exception{
        for(long number;(number=next())!=Long.MIN_VALUE;){
            int n=(int)number;parent=new int[n];size=new int[n];area=new long[n];Side[]vertical=new Side[2*n],horizontal=new Side[2*n];
            for(int i=0;i<n;i++){
                long x=next(),y=next(),w=next(),h=next();parent[i]=i;size[i]=1;area[i]=w*h;
                vertical[2*i]=new Side(x,y,y+h,i);vertical[2*i+1]=new Side(x+w,y,y+h,i);
                horizontal[2*i]=new Side(y,x,x+w,i);horizontal[2*i+1]=new Side(y+h,x,x+w,i);
            }
            connect(vertical);connect(horizontal);long answer=0;for(int i=0;i<n;i++)answer=Math.max(answer,area[find(i)]);System.out.println(answer);
        }
    }
}
