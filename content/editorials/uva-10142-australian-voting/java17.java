import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
public class Main {
 public static void main(String[] args)throws Exception{
  BufferedReader input=new BufferedReader(new InputStreamReader(System.in));String line=input.readLine();if(line==null)return;int tests=Integer.parseInt(line.trim());StringBuilder out=new StringBuilder();
  for(int test=0;test<tests;test++){
   do{line=input.readLine();}while(line!=null&&line.trim().isEmpty());
   int n=Integer.parseInt(line.trim());String[] names=new String[n];for(int i=0;i<n;i++)names[i]=input.readLine();
   ArrayList<int[]> ballots=new ArrayList<>();
   while((line=input.readLine())!=null&&!line.trim().isEmpty()){
    String[] parts=line.trim().split("\\s+");int[] ballot=new int[n];
    for(int i=0;i<n;i++)ballot[i]=Integer.parseInt(parts[i])-1;ballots.add(ballot);
   }
   boolean[] alive=new boolean[n];Arrays.fill(alive,true);ArrayList<Integer> winners=new ArrayList<>();
   while(winners.isEmpty()){
    int[] votes=new int[n];
    for(int[] ballot:ballots)for(int id:ballot)if(alive[id]){votes[id]++;break;}
    int least=Integer.MAX_VALUE,most=0;
    for(int i=0;i<n;i++)if(alive[i]){least=Math.min(least,votes[i]);most=Math.max(most,votes[i]);}
    if(2*most>ballots.size()){for(int i=0;i<n;i++)if(alive[i]&&votes[i]==most)winners.add(i);}
    else if(least==most){for(int i=0;i<n;i++)if(alive[i])winners.add(i);}
    else for(int i=0;i<n;i++)if(alive[i]&&votes[i]==least)alive[i]=false;
   }
   if(test>0)out.append('\n');for(int id:winners)out.append(names[id]).append('\n');
  }
  System.out.print(out);
 }
}
