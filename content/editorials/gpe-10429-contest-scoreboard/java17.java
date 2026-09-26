import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.StringTokenizer;
public class Main {
    public static void main(String[]args)throws Exception{
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));int tests=Integer.parseInt(input.readLine().trim());StringBuilder output=new StringBuilder();
        for(int test=0;test<tests;test++){
            boolean[]active=new boolean[101];boolean[][]accepted=new boolean[101][10];long[][]wrong=new long[101][10];int[]solved=new int[101];BigInteger[]penalty=new BigInteger[101];java.util.Arrays.fill(penalty,BigInteger.ZERO);
            String line;do{line=input.readLine();}while(line!=null&&line.trim().isEmpty());
            while(line!=null&&!line.trim().isEmpty()){
                StringTokenizer tokens=new StringTokenizer(line);int team=Integer.parseInt(tokens.nextToken()),problem=Integer.parseInt(tokens.nextToken());BigInteger minute=new BigInteger(tokens.nextToken());char verdict=tokens.nextToken().charAt(0);active[team]=true;
                if(!accepted[team][problem]){
                    if(verdict=='I')wrong[team][problem]++;
                    else if(verdict=='C'){accepted[team][problem]=true;solved[team]++;penalty[team]=penalty[team].add(minute).add(BigInteger.valueOf(20*wrong[team][problem]));}
                }
                line=input.readLine();
            }
            ArrayList<Integer>teams=new ArrayList<>();for(int i=1;i<=100;i++)if(active[i])teams.add(i);
            teams.sort(Comparator.comparingInt((Integer team)->-solved[team]).thenComparing(team->penalty[team]).thenComparingInt(team->team));
            if(test>0)output.append('\n');for(int team:teams)output.append(team).append(' ').append(solved[team]).append(' ').append(penalty[team]).append('\n');
        }
        System.out.print(output);
    }
}
