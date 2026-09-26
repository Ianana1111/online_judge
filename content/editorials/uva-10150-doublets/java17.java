import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;

public class Main {
    static long[] high,low;static int[] word;
    static int compare(long ah,long al,long bh,long bl){return ah!=bh?Long.compare(ah,bh):Long.compareUnsigned(al,bl);}
    static void swap(int a,int b){long t=high[a];high[a]=high[b];high[b]=t;t=low[a];low[a]=low[b];low[b]=t;int u=word[a];word[a]=word[b];word[b]=u;}
    static void sort(int left,int right){int i=left,j=right,m=(left+right)/2;long ph=high[m],pl=low[m];while(i<=j){while(compare(high[i],low[i],ph,pl)<0)i++;while(compare(high[j],low[j],ph,pl)>0)j--;if(i<=j)swap(i++,j--);}if(left<j)sort(left,j);if(i<right)sort(i,right);}
    public static void main(String[] args)throws Exception{BufferedReader in=new BufferedReader(new InputStreamReader(System.in));List<String> words=new ArrayList<>();Map<String,Integer> ids=new HashMap<>();String line;int total=0;while((line=in.readLine())!=null&&!line.isEmpty())if(!ids.containsKey(line)){ids.put(line,words.size());words.add(line);total+=line.length();}high=new long[total];low=new long[total];word=new int[total];int at=0;
        for(int u=0;u<words.size();u++){String text=words.get(u);long hi=(long)text.length()<<16,lo=0;for(int k=0;k<text.length();k++){long value=text.charAt(k)-'a'+1;int shift=5*k;if(shift<64){lo|=value<<shift;if(shift>59)hi|=value>>>(64-shift);}else hi|=value<<(shift-64);}
            for(int k=0;k<text.length();k++){long h=hi,l=lo;int shift=5*k;if(shift<64){l&=~(31L<<shift);if(shift>59)h&=~(31L>>>(64-shift));}else h&=~(31L<<(shift-64));high[at]=h;low[at]=l;word[at++]=u;}
        }if(total>0)sort(0,total-1);int[][] buckets=new int[words.size()][];for(int u=0;u<words.size();u++)buckets[u]=new int[words.get(u).length()];int[] degree=new int[words.size()],ending=new int[total],seen=new int[total];for(int begin=0;begin<total;){int end=begin+1;while(end<total&&high[end]==high[begin]&&low[end]==low[begin])end++;ending[begin]=end;for(int p=begin;p<end;p++){int u=word[p];buckets[u][degree[u]++]=begin;}begin=end;}
        int query=0;int[] previous=new int[words.size()],queue=new int[words.size()];while((line=in.readLine())!=null){StringTokenizer tokens=new StringTokenizer(line);if(!tokens.hasMoreTokens())continue;String a=tokens.nextToken(),b=tokens.nextToken();if(query>0)System.out.println();query++;Integer start=ids.get(a),finish=ids.get(b);if(start==null||finish==null||a.length()!=b.length()){System.out.println("No solution.");continue;}Arrays.fill(previous,-1);previous[start]=start;int front=0,back=1;queue[0]=start;
            while(front<back&&previous[finish]<0){int u=queue[front++];for(int bucket:buckets[u]){if(seen[bucket]==query)continue;seen[bucket]=query;for(int p=bucket;p<ending[bucket];p++){int v=word[p];if(previous[v]<0){previous[v]=u;queue[back++]=v;}}}}if(previous[finish]<0){System.out.println("No solution.");continue;}int count=0;for(int u=finish;;u=previous[u]){queue[count++]=u;if(u==start)break;}while(count>0)System.out.println(words.get(queue[--count]));
        }
    }
}
