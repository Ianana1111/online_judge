import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Map;
import java.util.StringTokenizer;
import java.util.TreeMap;

public class Main {
    static BufferedReader in=new BufferedReader(new InputStreamReader(System.in));static StringTokenizer tokens=new StringTokenizer("");
    static String word()throws Exception{while(!tokens.hasMoreTokens())tokens=new StringTokenizer(in.readLine());return tokens.nextToken();}
    static int number()throws Exception{return Integer.parseInt(word());}
    static BigInteger money()throws Exception{return new BigInteger(word().replace(".",""));}
    static BigInteger[][] cost,memo;static BigInteger[] profit;static int k;
    static BigInteger best(int mask,int current){if(memo[current][mask]!=null)return memo[current][mask];BigInteger answer=cost[current][0].negate();for(int i=1;i<=k;i++){int bit=1<<(i-1);if((mask&bit)==0)answer=answer.max(profit[i].subtract(cost[current][i]).add(best(mask|bit,i)));}return memo[current][mask]=answer;}
    static long[][] smallCost,smallMemo;static long[] smallProfit;
    static long smallBest(int mask,int current){if(smallMemo[current][mask]!=Long.MIN_VALUE)return smallMemo[current][mask];long answer=-smallCost[current][0];for(int i=1;i<=k;i++){int bit=1<<(i-1);if((mask&bit)==0)answer=Math.max(answer,smallProfit[i]-smallCost[current][i]+smallBest(mask|bit,i));}return smallMemo[current][mask]=answer;}
    public static void main(String[] args)throws Exception{int cases=number();while(cases-->0){int n=number(),m=number();BigInteger[][] distance=new BigInteger[n+1][n+1];BigInteger largest=BigInteger.ZERO;for(int i=0;i<=n;i++)distance[i][i]=BigInteger.ZERO;for(int i=0;i<m;i++){int u=number(),v=number();BigInteger value=money();largest=largest.max(value);if(distance[u][v]==null||value.compareTo(distance[u][v])<0)distance[u][v]=distance[v][u]=value;}
        Map<Integer,BigInteger> savings=new TreeMap<>();int offers=number();for(int i=0;i<offers;i++){int store=number();BigInteger amount=money();largest=largest.max(amount);savings.merge(store,amount,BigInteger::add);}k=savings.size();int[] stores=new int[k+1];profit=new BigInteger[k+1];int index=1;for(Map.Entry<Integer,BigInteger> entry:savings.entrySet()){stores[index]=entry.getKey();profit[index++]=entry.getValue();}
        BigInteger amount;
        // This bound covers two simple road paths and every DVD discount.
        if(largest.multiply(BigInteger.valueOf(2L*(n+offers+2))).bitLength()<63){
            long[][] travel=new long[n+1][n+1];for(int u=0;u<=n;u++)for(int v=0;v<=n;v++)travel[u][v]=distance[u][v]==null?Long.MAX_VALUE:distance[u][v].longValue();
            for(int mid=0;mid<=n;mid++)for(int u=0;u<=n;u++)if(travel[u][mid]!=Long.MAX_VALUE)for(int v=0;v<=n;v++)if(travel[mid][v]!=Long.MAX_VALUE)travel[u][v]=Math.min(travel[u][v],travel[u][mid]+travel[mid][v]);
            smallCost=new long[k+1][k+1];smallProfit=new long[k+1];for(int i=0;i<=k;i++){if(i>0)smallProfit[i]=profit[i].longValue();for(int j=0;j<=k;j++)smallCost[i][j]=travel[stores[i]][stores[j]];}smallMemo=new long[k+1][1<<k];for(long[] row:smallMemo)Arrays.fill(row,Long.MIN_VALUE);amount=BigInteger.valueOf(smallBest(0,0));
        }else{
            for(int mid=0;mid<=n;mid++)for(int u=0;u<=n;u++)if(distance[u][mid]!=null)for(int v=0;v<=n;v++)if(distance[mid][v]!=null){BigInteger value=distance[u][mid].add(distance[mid][v]);if(distance[u][v]==null||value.compareTo(distance[u][v])<0)distance[u][v]=value;}
            cost=new BigInteger[k+1][k+1];for(int i=0;i<=k;i++)for(int j=0;j<=k;j++)cost[i][j]=distance[stores[i]][stores[j]];memo=new BigInteger[k+1][1<<k];amount=best(0,0);
        }
        if(amount.signum()<=0)System.out.println("Don't leave the house");else{BigInteger[] parts=amount.divideAndRemainder(BigInteger.valueOf(100));System.out.printf("Daniel can save $%s.%02d%n",parts[0],parts[1].intValue());}
        memo=null;smallMemo=null;
    }}
}
