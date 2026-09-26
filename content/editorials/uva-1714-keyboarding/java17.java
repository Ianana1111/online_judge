import java.io.BufferedInputStream;
import java.util.BitSet;
public class Main {
    static BufferedInputStream input=new BufferedInputStream(System.in);
    static String next()throws Exception{int c;do{c=input.read();}while(c>=0&&c<=32);if(c<0)return null;StringBuilder value=new StringBuilder();while(c>32){value.append((char)c);c=input.read();}return value.toString();}
    public static void main(String[]args)throws Exception{
        String token;int[]dr={1,-1,0,0},dc={0,0,1,-1};StringBuilder output=new StringBuilder();
        while((token=next())!=null){
            int rows=Integer.parseInt(token),columns=Integer.parseInt(next()),size=rows*columns;char[]board=new char[size];
            for(int r=0;r<rows;r++){String line=next();line.getChars(0,columns,board,r*columns);}char[]text=(next()+"*").toCharArray();int[][]moves=new int[size][4];int[]degree=new int[size];
            for(int r=0;r<rows;r++)for(int c=0;c<columns;c++)for(int d=0;d<4;d++){
                int at=r*columns+c,rr=r+dr[d],cc=c+dc[d];
                while(rr>=0&&rr<rows&&cc>=0&&cc<columns&&board[rr*columns+cc]==board[at]){rr+=dr[d];cc+=dc[d];}
                if(rr>=0&&rr<rows&&cc>=0&&cc<columns)moves[at][degree[at]++]=rr*columns+cc;
            }
            BitSet seen=new BitSet(size*(text.length+1));seen.set(0);int[]frontier=new int[size],following=new int[size];frontier[0]=0;int count=1,steps=0,answer=-1;
            while(count>0&&answer<0){
                int nextCount=0;
                for(int i=0;i<count;i++){
                    int state=frontier[i],progress=state/size,cell=state%size;if(progress==text.length){answer=steps;break;}
                    if(board[cell]==text[progress]){int to=state+size;if(!seen.get(to)){seen.set(to);following[nextCount++]=to;}}
                    int base=state-cell;
                    for(int d=0;d<degree[cell];d++){int to=base+moves[cell][d];if(!seen.get(to)){seen.set(to);following[nextCount++]=to;}}
                }
                int[]swap=frontier;frontier=following;following=swap;count=nextCount;steps++;
            }
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
