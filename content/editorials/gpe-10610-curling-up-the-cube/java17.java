import java.io.BufferedInputStream;
import java.util.Arrays;
public class Main {
    static BufferedInputStream input=new BufferedInputStream(System.in);
    static int next()throws Exception{int c;do{c=input.read();}while(c>=0&&c<=32);int value=0;while(c>32){value=value*10+c-'0';c=input.read();}return value;}
    public static void main(String[]args)throws Exception{
        int tests=next();StringBuilder out=new StringBuilder();int[]dr={0,0,1,-1},dc={1,-1,0,0};
        for(int test=0;test<tests;test++){
            int[]board=new int[36],queue=new int[36];int[][]frame=new int[36][];int start=0;
            for(int i=0;i<36;i++){board[i]=next();if(board[i]!=0)start=i;}
            frame[start]=new int[]{1,2,3};queue[0]=start;int front=0,back=1,distinct=0;boolean valid=true;boolean[]normal=new boolean[7];
            while(front<back){
                int at=queue[front++],r=at/6,c=at%6,u=frame[at][0],v=frame[at][1],n=frame[at][2];
                if(!normal[n+3]){normal[n+3]=true;distinct++;}
                int[][]turns={{-n,v,u},{n,v,-u},{u,-n,v},{u,n,-v}};
                for(int direction=0;direction<4;direction++){
                    int rr=r+dr[direction],cc=c+dc[direction];if(rr<0||rr>=6||cc<0||cc>=6)continue;
                    int nxt=rr*6+cc;if(board[nxt]==0)continue;
                    if(frame[nxt]!=null){if(!Arrays.equals(frame[nxt],turns[direction]))valid=false;}
                    else{frame[nxt]=turns[direction];queue[back++]=nxt;}
                }
            }
            if(test!=0)out.append('\n');out.append(valid&&back==6&&distinct==6?"correct\n":"incorrect\n");
        }
        System.out.print(out);
    }
}
