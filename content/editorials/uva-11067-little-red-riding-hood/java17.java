import java.math.BigInteger;
import java.io.BufferedInputStream;
public class Main {
    static BufferedInputStream input=new BufferedInputStream(System.in);
    static int next()throws Exception{int c;do{c=input.read();}while(c>=0&&c<=32);if(c<0)return -1;int value=0;while(c>32){value=value*10+c-'0';c=input.read();}return value;}
    public static void main(String[]args)throws Exception{
        for(int width;(width=next())>=0;){
            int height=next();if(width==0&&height==0)break;
            boolean[][]blocked=new boolean[101][101];int count=next();
            while(count-->0){int x=next(),y=next();blocked[y][x]=true;}
            BigInteger[]ways=new BigInteger[width+1];java.util.Arrays.fill(ways,BigInteger.ZERO);ways[0]=BigInteger.ONE;
            for(int y=0;y<=height;y++)for(int x=0;x<=width;x++){
                if(blocked[y][x])ways[x]=BigInteger.ZERO;else if(x>0)ways[x]=ways[x].add(ways[x-1]);
            }
            BigInteger answer=ways[width];
            if(answer.signum()==0)System.out.println("There is no path.");
            else if(answer.equals(BigInteger.ONE))System.out.println("There is one path from Little Red Riding Hood's house to her grandmother's house.");
            else System.out.println("There are "+answer+" paths from Little Red Riding Hood's house to her grandmother's house.");
        }
    }
}
