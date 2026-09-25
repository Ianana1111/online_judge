import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        long[] events=new long[400000];int count=0;String line;
        while((line=input.readLine())!=null && !line.trim().equals(".")) {
            int[] endpoints=new int[2];int found=0,at=0;
            while(found<2 && at<line.length()) {
                while(at<line.length() && line.charAt(at)<=' ') ++at;
                if(at==line.length()) break;
                int sign=1;if(line.charAt(at)=='-') {sign=-1;++at;}
                int value=0;
                while(at<line.length() && line.charAt(at)>='0' && line.charAt(at)<='9')
                    value=value*10+line.charAt(at++)-'0';
                endpoints[found++]=sign*value;
            }
            if(found<2) continue;
            events[count++]=((long)endpoints[0]<<1)|1L;
            events[count++]=((long)endpoints[1]<<1);
        }
        Arrays.sort(events,0,count);
        long active=0,answer=0,previous=count==0?0:events[0]>>1;
        for(int i=0;i<count;++i) {
            long position=events[i]>>1;
            answer+=(position-previous)*(active*(active-1)/2);
            active+=(events[i]&1L)==1L?1:-1;
            previous=position;
        }
        System.out.println(answer);
    }
}
