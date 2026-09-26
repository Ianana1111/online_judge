import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.StringTokenizer;

public class Main {
    static class Entry{long sum;int mask;Entry(long sum,int mask){this.sum=sum;this.mask=mask;}}
    static Entry[] half(long[] values,int begin,int length){Entry[] entries=new Entry[1<<length];entries[0]=new Entry(0,0);for(int mask=1;mask<entries.length;mask++){int bit=mask&-mask;entries[mask]=new Entry(entries[mask^bit].sum+values[begin+Integer.numberOfTrailingZeros(bit)],mask);}Arrays.sort(entries,Comparator.comparingLong((Entry e)->e.sum).thenComparingInt(e->e.mask));return entries;}
    static int lower(Entry[] entries,long value){int l=0,r=entries.length;while(l<r){int m=(l+r)/2;if(entries[m].sum<value)l=m+1;else r=m;}return l;}
    public static void main(String[] args)throws Exception{BufferedReader in=new BufferedReader(new InputStreamReader(System.in));String line;boolean first=true;while((line=in.readLine())!=null){line=line.trim();if(line.equals("."))break;if(line.isEmpty())continue;StringTokenizer tokens=new StringTokenizer(line.replace('{',' ').replace('}',' '));long[] values=new long[tokens.countTokens()];long total=0;for(int i=0;i<values.length;i++){values[i]=Long.parseLong(tokens.nextToken());total+=values[i];}Arrays.sort(values);List<Integer> answers=new ArrayList<>();if(total%2==0){int middle=values.length/2;Entry[] left=half(values,0,middle),right=half(values,middle,values.length-middle);for(Entry e:left){long target=total/2-e.sum;for(int j=lower(right,target);j<right.length&&right[j].sum==target;j++)answers.add(e.mask|(right[j].mask<<middle));}}
        answers.sort((a,b)->{int x=Integer.bitCount(a),y=Integer.bitCount(b);if(x!=y)return x-y;int difference=a^b;if(difference==0)return 0;return(a&(difference&-difference))!=0?-1:1;});if(!first)System.out.println();first=false;if(answers.isEmpty()){System.out.println("No such subset");continue;}System.out.println(answers.size()+" subsets.");for(int mask:answers){StringBuilder out=new StringBuilder("{");boolean initial=true;for(int i=0;i<values.length;i++)if((mask&(1<<i))!=0){if(!initial)out.append(' ');initial=false;out.append(values[i]);}System.out.println(out.append('}'));}
    }}
}
